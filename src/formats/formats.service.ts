import { Injectable } from '@nestjs/common';

@Injectable()
export class FormatsService {
  async currency(value: string, locale: string, currency: string) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(Number(value));

    return { value: formatted };
  }
}
