import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenPixService } from 'openpix-nestjs';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CustomersRepository } from '@/customers/customers.repository';
import { ChargesRepository } from './charges.repository';
import { randomUUID } from 'crypto';
import { Charge } from './entities/charge.entity';
import { PayChargeDto } from './entities/pay.dto';

@Injectable()
export class ChargesService {
  constructor(
    private readonly openPixService: OpenPixService,
    private readonly customersRepository: CustomersRepository,
    private readonly chargesRepository: ChargesRepository,
  ) {}

  async create(createChargeDto: CreateChargeDto) {
    const customer = await this.customersRepository.findByCorrelationId(
      createChargeDto.customerId,
    );

    if (!!createChargeDto.customerId && !customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND');
    }

    const isValidPaymentMethods = this.validateGatewayPaymetMethods(
      createChargeDto.gateway,
      createChargeDto.methods,
    );

    if (!isValidPaymentMethods.isValid) {
      throw new BadRequestException(
        'INVALID_PAYMENT_METHODS',
        `Accepted: ${isValidPaymentMethods.accepteds.join(', ')}; Invalid: ${isValidPaymentMethods.invalids.join(
          ', ',
        )}`,
      );
    }

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      amount: createChargeDto.amount,
      correlationID: createChargeDto.correlationID ?? randomUUID(),
      description: createChargeDto.description,
      liqAmount: createChargeDto.amount,
      customer,
    });

    return charge;
  }

  async pay(chargeId: string, paymentMethod: PayChargeDto) {
    const charge = await this.chargesRepository.findOneOrFail({
      correlationID: chargeId,
    });

    const isValidPaymentMethods = this.validatePaymentMethods(
      [paymentMethod.method],
      charge.methods,
    );

    if (!isValidPaymentMethods.isValid) {
      throw new BadRequestException(
        'INVALID_PAYMENT_METHOD',
        `Accepted: ${isValidPaymentMethods.accepteds.join(', ')}; Invalid: ${isValidPaymentMethods.invalids.join(
          ', ',
        )}`,
      );
    }

    const status = charge.status.split(':')[1] ?? charge.status;

    if (status === 'PAID') {
      throw new BadRequestException('CHARGE_ALREADY_PAID');
    }

    return this.choosePaymentGateway(charge);
  }

  async openPixMarkPaid(chargeId: string) {
    const charge = await this.chargesRepository.findOneOrFail({
      gatewayID: chargeId,
    });

    const pix = await this.openPixService.charge.get(charge.gatewayID);
    const transaction = await this.openPixService.transaction.get(
      pix.transactionID,
    );

    if (pix.status !== 'COMPLETED') {
      throw new BadRequestException('CHARGE_NOT_PAID');
    }

    return this.chargesRepository.update(charge.id, {
      status: 'PIX:PAID',
      pix: pix.paymentMethods.pix,
      metadata: pix,
      endToEndId: transaction.endToEndId,
      paidAt: transaction.charge.paidAt,
    });
  }

  validateGatewayPaymetMethods(gateway: string, paymentMethods: string[]) {
    switch (gateway) {
      case 'OPENPIX':
        return this.validatePaymentMethods(paymentMethods, ['PIX']);
    }
  }

  validatePaymentMethods(methods: string[], accepteds: string[]) {
    const isValid = methods.every((method) => accepteds.includes(method));

    return {
      isValid,
      accepteds,
      invalids: methods.filter((method) => !accepteds.includes(method)),
    };
  }

  private choosePaymentGateway(charge: Charge) {
    switch (charge.gateway) {
      case 'OPENPIX':
        return this.openPixCharge(charge);
    }
  }

  private async openPixCharge(charge: Charge) {
    const existsPix = await this.openPixService.charge
      .get(charge.gatewayID)
      .catch(() => null);

    if (existsPix) {
      await this.openPixService.charge.delete(charge.gatewayID);
    }

    const pix = await this.openPixService.charge.create({
      value: charge.amount + charge.additionalFee,
      correlationID: randomUUID(),
      expiresIn: charge.expiresIn ?? 3600,
      comment: charge.description ?? undefined,
    });

    return this.chargesRepository.update(charge.id, {
      status: 'PIX:WAITING_PAYMENT',
      transactionID: pix.transactionID,
      gatewayID: pix.correlationID,
      pix: pix.paymentMethods.pix,
      fee: pix.fee,
      expiresIn: pix.expiresIn,
      metadata: pix,
      expiresDate: pix.expiresDate,
    });
  }
}
