import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InvoicesRepository } from './invoices.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiUrl = configService.getOrThrow<string>('NFE_API_URL');
        const token = configService.getOrThrow<string>('NFE_API_TOKEN');
        return {
          baseURL: apiUrl,
          auth: {
            username: token,
            password: '',
          },
        };
      },
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesRepository],
  exports: [InvoicesService, InvoicesRepository],
})
export class InvoicesModule {}
