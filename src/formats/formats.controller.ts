import { Controller, Get, Query } from '@nestjs/common';
import { FormatsService } from './formats.service';

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get('currency')
  async currency(
    @Query('value') value: string,
    @Query('locale') locale: string,
    @Query('currency') currency: string,
  ) {
    return this.formatsService.currency(
      value,
      locale ?? 'pt-BR',
      currency ?? 'BRL',
    );
  }
}
