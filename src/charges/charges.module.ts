import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { OpenPixModule } from 'openpix-nestjs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './entities/charge.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersRepository } from '@/customers/customers.repository';
import { ChargesRepository } from './charges.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge, Customer]),
    OpenPixModule.register({
      appId:
        'Q2xpZW50X0lkXzVkNzY4Y2IwLTJjYjAtNDhhNi04MzhmLWFmZDVhN2UyMjgwMTpDbGllbnRfU2VjcmV0X2ZTZXdOU1J1TmlTUGVTUWp4aFNPMEloMGlNdHNxaWRDeUdMVTUzWDdOOWc9',
    }),
  ],
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, CustomersRepository],
  exports: [ChargesService],
})
export class ChargesModule {}
