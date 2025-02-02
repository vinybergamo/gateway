import { ChargesService } from '@/charges/charges.service';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { WebhookRepository } from './webhook.repository';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({
  scope: Scope.REQUEST,
})
export class WebhookService {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly chargesService: ChargesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  handleChargeEvent(event: string, body: Record<string, any>) {
    switch (event) {
      case 'paid':
        return this.chargePaid(body);
    }
  }

  async chargePaid(body: Record<string, any>) {
    this.saveWebhook('charge.paid', body);
    if (!!body.event) {
      if (body.event.startsWith('OPENPIX')) {
        const event = body.event.split(':')[1];
        this.handleOpenPixEvent(event, body);
      }
    }
  }

  async handleOpenPixEvent(event: string, body: Record<string, any>) {
    switch (event) {
      case 'CHARGE_COMPLETED':
        return this.chargesService.openPixMarkPaid(body.charge.correlationID);
    }
  }

  private async saveWebhook(event: string, body: Record<string, any>) {
    const request = this.request;
    const originalUrl = request.originalUrl;
    const method = request.method;
    const headers = request.headers;
    const ip = request.ip;
    const bodyString = JSON.stringify(body);
    const host = request.hostname;

    return this.webhookRepository.create({
      event,
      host,
      originalUrl,
      method,
      headers,
      ip,
      body: bodyString,
      data: body,
    });
  }
}
