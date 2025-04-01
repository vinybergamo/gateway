import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { Charge } from '@/charges/entities/charge.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { format } from 'date-fns';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly httpService: HttpService,
  ) {}

  async createPerCharge(charge: Charge, customer: Customer) {
    const now = new Date();
    const date = format(now, 'yyyy-MM-dd');
    const time = format(now, 'HH:mm:ss');
    const issueDate = `${date}T${time}`;

    const invoice = await this.invoicesRepository.create({
      type: 'NFSE',
      charge,
      customer,
    });

    const documentType = customer.documentType.toLowerCase();

    const request = this.httpService.post(
      '/v2/nfse',
      {
        data_emissao: issueDate,
        prestador: {
          cnpj: '49219537000136',
          codigo_municipio: '3541000',
          inscricao_municipal: '705850001',
        },
        tomador: {
          [documentType]: customer.document,
          razao_social: customer.name,
          email: customer.email,
        },
        servico: {
          discriminacao: charge.description,
          iss_retido: 'false',
          item_lista_servico: '1402',
          valor_servicos: charge.amount / 100,
          codigo_tributario_municipio: '9511800',
          aliquota: 2,
        },
      },
      {
        params: {
          ref: invoice.correlationID,
        },
      },
    );

    const { data } = await firstValueFrom(request);

    const updatedInvoice = await this.invoicesRepository.update(invoice.id, {
      status: 'PROCESSING',
      rpsNumber: data.numero_rps,
      rpsSeries: data.serie_rps,
      rpsType: data.tipo_rps,
    });

    return updatedInvoice;
  }

  async markAsAuthorized(uuid: string) {
    const invoice = await this.invoicesRepository.findOne({
      correlationID: uuid,
    });

    if (!invoice) {
      return;
    }

    const request = this.httpService.get(`/v2/nfse/${invoice.correlationID}`);

    const { data } = await firstValueFrom(request);

    if (data.status === 'autorizado') {
      await this.invoicesRepository.update(invoice.correlationID, {
        status: 'AUTHORIZED',
        rpsNumber: data.numero_rps,
        rpsSeries: data.serie_rps,
        rpsType: data.tipo_rps,
        issueDate: data.data_emissao,
        verificationCode: data.codigo_verificacao,
        url: data.url,
        xmlPath: data.caminho_xml_nota_fiscal,
        danfseUrl: data.url_danfse,
      });
    }
  }
}
