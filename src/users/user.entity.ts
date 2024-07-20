import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Account } from '../account/account.entity';
import { Customer } from '../customer/customer.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Account, account => account.customer)
  accounts: Account[];

  @OneToOne(() => Customer, { cascade: true })
  @JoinColumn()
  customer: Customer;

}
