import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ChargesModule } from '@/charges/charges.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookData } from './entities/webhook.entity';
import { WebhookRepository } from './webhook.repository';
import { InvoicesModule } from '@/invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookData]),
    ChargesModule,
    InvoicesModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookRepository],
})
export class WebhookModule {}
