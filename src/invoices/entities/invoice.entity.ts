import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseSchema } from '../../database/base-schema';
import { Charge } from '@/charges/entities/charge.entity';
import { Customer } from '@/customers/entities/customer.entity';

@Entity()
export class Invoice extends BaseSchema {
  @Column({
    generated: 'uuid',
  })
  correlationID: string;

  @Column({ default: 'NFSE' })
  type: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  rpsNumber: string;

  @Column({ nullable: true })
  rpsSeries: string;

  @Column({ nullable: true })
  rpsType: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  xmlPath: string;

  @Column({ nullable: true })
  danfseUrl: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true })
  issueDate: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices)
  customer: Customer;

  @JoinColumn()
  @OneToOne(() => Charge, (charge) => charge.invoice)
  charge: Charge;
}
