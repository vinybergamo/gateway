import { BaseRepository } from '@/database/base-repository';
import { Injectable } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InvoicesRepository extends BaseRepository<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    private readonly r: Repository<Invoice>,
  ) {
    super(r);
  }
}
