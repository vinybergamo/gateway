import { BaseRepository } from '@/database/base-repository';
import { Injectable } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersRepository extends BaseRepository<Customer> {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {
    super(repo);
  }

  async findByCorrelationIdOrFail(correlationId: string) {
    return this.findOneOrFail({ correlationID: correlationId });
  }

  async findByCorrelationId(correlationId: string) {
    return this.findOne({ correlationID: correlationId });
  }
}
