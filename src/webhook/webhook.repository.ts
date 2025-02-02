import { BaseRepository } from '@/database/base-repository';
import { Injectable } from '@nestjs/common';
import { WebhookData } from './entities/webhook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WebhookRepository extends BaseRepository<WebhookData> {
  constructor(
    @InjectRepository(WebhookData)
    private readonly repo: Repository<WebhookData>,
  ) {
    super(repo);
  }
}
