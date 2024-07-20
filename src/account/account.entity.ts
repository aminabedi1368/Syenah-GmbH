import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    balance: number;

    @ManyToOne(() => Customer, (customer) => customer.accounts)
    customer: Customer;

    @OneToMany(() => Transaction, (transaction) => transaction.account)
    transactions: Transaction[];
}
