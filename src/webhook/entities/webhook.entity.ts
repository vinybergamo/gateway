import { Column, Entity } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';

@Entity()
export class WebhookData extends BaseSchema {
  @Column()
  host: string;

  @Column()
  originalUrl: string;

  @Column()
  method: string;

  @Column({ type: 'jsonb' })
  headers: Record<string, any>;

  @Column()
  ip: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  event: string;

  @Column({ nullable: true })
  from: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;
}
