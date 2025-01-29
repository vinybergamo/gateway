import { BeforeInsert, Column, Entity } from 'typeorm';
import { BaseSchema } from 'src/database/base-schema';
import { Exclude } from 'class-transformer';
import { hashSync, compareSync, genSaltSync, compare } from 'bcrypt';

@Entity()
export class User extends BaseSchema {
  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  hashPassword() {
    const salt = genSaltSync(10);
    const hash = hashSync(this.password, salt);
    this.password = hash;
  }

  passwordMatch(password: string): boolean {
    return compareSync(password, this.password);
  }

  @BeforeInsert()
  beforeInsertActions() {
    this.hashPassword();
  }
}
