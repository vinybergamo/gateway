import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { ChargesRepository } from '@/charges/charges.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly chargesRepository: ChargesRepository,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customerExists = await this.customersRepository.findByCorrelationId(
      createCustomerDto.correlationID,
    );

    if (customerExists) {
      throw new BadRequestException(
        'CUSTOMER_ALREADY_EXISTS_WITH_CORRELATION_ID',
      );
    }

    return this.customersRepository.create({
      ...createCustomerDto,
      documentType: createCustomerDto.document.length === 11 ? 'CPF' : 'CNPJ',
    });
  }

  async listCustomerCharges(customerId: string) {
    const customer =
      await this.customersRepository.findByCorrelationIdOrFail(customerId);

    const charges = await this.chargesRepository.find({
      customer: {
        id: customer.id,
      },
    });

    return charges;
  }
}
