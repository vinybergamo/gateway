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

const avaliableGatewayPaymentMethods = {
  OPENPIX: ['PIX'],
} as const;

@Injectable()
export class ChargesService {
  constructor(
    private readonly openPixService: OpenPixService,
    private readonly customersRepository: CustomersRepository,
    private readonly chargesRepository: ChargesRepository,
  ) {}

  async findOneOrFail(chargeId: string) {
    return this.chargesRepository.findOneOrFail(
      { correlationID: chargeId },
      {
        relations: ['customer'],
      },
    );
  }

  async create(createChargeDto: CreateChargeDto) {
    const isValidGateway = this.validatePaymentMethods(
      createChargeDto.gateway,
      createChargeDto.methods,
    );

    if (!isValidGateway.isGatewayValid) {
      throw new BadRequestException(
        'INVALID_GATEWAY',
        `Accepted: ${isValidGateway.validsGateways.join(', ')}`,
      );
    }

    if (!isValidGateway.isMethodsValid) {
      throw new BadRequestException(
        'INVALID_PAYMENT_METHODS',
        `Accepted: ${isValidGateway.accepteds.join(', ')}; Invalid: ${isValidGateway.invalidsMethods.join(
          ', ',
        )}`,
      );
    }

    if (createChargeDto.correlationID) {
      const existsCharge = await this.chargesRepository.findOne({
        correlationID: createChargeDto.correlationID,
      });

      if (existsCharge) {
        throw new BadRequestException('CHARGE_ALREADY_EXISTS');
      }
    }

    const customer = await this.customersRepository.findByCorrelationId(
      createChargeDto.customerId,
    );

    if (!!createChargeDto.customerId && !customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND');
    }

    const charge = await this.chargesRepository.create({
      ...createChargeDto,
      status: 'PENDING',
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

    const isValidPaymentMethods = this.validatePaymentMethods(charge.gateway, [
      paymentMethod.method,
    ]);

    if (!isValidPaymentMethods.isMethodsValid) {
      throw new BadRequestException(
        'INVALID_PAYMENT_METHOD',
        `Accepted: ${isValidPaymentMethods.accepteds.join(', ')}; Invalid: ${isValidPaymentMethods.invalidsMethods.join(
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
        return this.validatePaymentMethods(gateway, paymentMethods);
    }
  }

  validatePaymentMethods(gateway: string, methods: string[]) {
    const isValidGateway = gateway in avaliableGatewayPaymentMethods;

    if (!isValidGateway) {
      return {
        isGatewayValid: false,
        validsGateways: Object.keys(avaliableGatewayPaymentMethods),
      };
    }

    const acceptedMethods = avaliableGatewayPaymentMethods[gateway];
    const invalids = methods.filter(
      (method) => !acceptedMethods.includes(method),
    );

    const isValid = invalids.length === 0;

    return {
      isGatewayValid: isValidGateway,
      isMethodsValid: isValid,
      validsGateways: Object.keys(avaliableGatewayPaymentMethods),
      invalidsMethods: invalids,
      accepteds: acceptedMethods,
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
      if (existsPix.status === 'COMPLETED') {
        return this.openPixMarkPaid(charge.gatewayID);
      }

      if (existsPix.status === 'ACTIVE') {
        return this.chargesRepository.update(charge.id, {
          status: 'PIX:PENDING',
          transactionID: existsPix.transactionID,
          pix: existsPix.paymentMethods.pix,
          fee: existsPix.fee,
          expiresIn: existsPix.expiresIn,
          metadata: existsPix,
          expiresDate: existsPix.expiresDate,
        });
      }

      await this.openPixService.charge.delete(charge.gatewayID);
    }

    const pix = await this.openPixService.charge.create({
      value: charge.amount + charge.additionalFee,
      correlationID: randomUUID(),
      expiresIn: charge.expiresIn ?? 3600,
      comment: charge.description ?? undefined,
    });

    return this.chargesRepository.update(charge.id, {
      status: 'PIX:PENDING',
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
