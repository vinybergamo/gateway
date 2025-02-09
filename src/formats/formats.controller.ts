import { Controller, Get, Query } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { IsPublic } from '@/helpers/decorators/is-public.decorator';

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @IsPublic()
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
