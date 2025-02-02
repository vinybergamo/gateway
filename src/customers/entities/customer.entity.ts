import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';
import { Charge } from '@/charges/entities/charge.entity';

@Entity()
export class Customer extends BaseSchema {
  @Column()
  name: string;

  @Column()
  document: string;

  @Column()
  documentType: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  correlationID: string;

  @OneToMany(() => Charge, (charge) => charge.customer)
  charges: Charge[];
}
