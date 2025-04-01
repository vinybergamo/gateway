import { ChargesService } from '@/charges/charges.service';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { WebhookRepository } from './webhook.repository';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InvoicesService } from '@/invoices/invoices.service';

@Injectable({
  scope: Scope.REQUEST,
})
export class WebhookService {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly chargesService: ChargesService,
    private readonly invoicesService: InvoicesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  handleChargeEvent(event: string, body: Record<string, any>) {
    switch (event) {
      case 'paid':
        return this.chargePaid(body);
      default:
        return this.saveWebhook(event, body);
    }
  }

  handleInvoiceEvent(event: string, body: Record<string, any>) {
    this.saveWebhook(event, body);
    switch (event) {
      case 'nfse':
        return this.handleNfseEvent(body);
    }
  }

  async handleNfseEvent(body: Record<string, any>) {
    switch (body.status) {
      case 'autorizado':
        return this.invoicesService.markAsAuthorized(body.ref);
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
