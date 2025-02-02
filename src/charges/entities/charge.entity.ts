import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';
import { Customer } from '@/customers/entities/customer.entity';

@Entity()
export class Charge extends BaseSchema {
  @Column({ nullable: true })
  correlationID: string;

  @Column({ nullable: true })
  gatewayID: string;

  @Column({ nullable: true })
  transactionID: string;

  @Column({ nullable: true })
  endToEndId: string;

  @Column({ nullable: true })
  gateway: string;

  @Column()
  amount: number;

  @Column({ default: 0 })
  additionalFee: number;

  @Column({ default: 0 })
  totalAmount: number;

  @Column({ default: 0 })
  fee: number;

  @Column()
  liqAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', array: true })
  methods: string[];

  @Column({ nullable: true, default: 'CREATED' })
  status: string;

  @Column({ nullable: true })
  expiresIn: number;

  @Column({ nullable: true })
  expiresDate: Date;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ nullable: true })
  paidAt: string;

  @Column({ nullable: true, type: 'jsonb' })
  pix: Record<string, any>;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @ManyToOne(() => Customer, (customer) => customer.charges)
  customer: Customer;

  @BeforeInsert()
  setDefaults() {
    this.totalAmount = this.amount + this.additionalFee;
    this.liqAmount = this.totalAmount - (this.fee ?? 0);
  }

  @BeforeUpdate()
  updateDefaults() {
    this.totalAmount = this.amount + this.additionalFee;
    this.liqAmount = this.totalAmount - (this.fee ?? 0);
  }
}
