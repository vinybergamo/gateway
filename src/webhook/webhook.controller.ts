import { Body, Controller, Param, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { IsPublic } from '@/helpers/decorators/is-public.decorator';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @IsPublic()
  @Post('charges/:event')
  handleChargeEvent(
    @Param('event') event: string,
    @Body() body: Record<string, any>,
  ) {
    this.webhookService.handleChargeEvent(event, body);

    return { message: 'Event received' };
  }

  @IsPublic()
  @Post('invoices/:event')
  handleInvoiceEvent(
    @Param('event') event: string,
    @Body() body: Record<string, any>,
  ) {
    this.webhookService.handleInvoiceEvent(event, body);

    return { message: 'Event received' };
  }
}
