import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './entities/charge.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { CustomersRepository } from '@/customers/customers.repository';
import { ChargesRepository } from './charges.repository';
import { OpenPixModule } from 'openpix-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvoicesModule } from '@/invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge, Customer]),
    OpenPixModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const appId = configService.get('OPENPIX_APP_ID');
        return {
          appId,
        };
      },
    }),
    InvoicesModule,
  ],
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, CustomersRepository],
  exports: [ChargesService],
})
export class ChargesModule {}
