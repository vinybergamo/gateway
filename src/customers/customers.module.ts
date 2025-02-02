import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Charge } from '@/charges/entities/charge.entity';
import { ChargesRepository } from '@/charges/charges.repository';
import { CustomersRepository } from './customers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Charge])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository, ChargesRepository],
})
export class CustomersModule {}
