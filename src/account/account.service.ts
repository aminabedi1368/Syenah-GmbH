import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { Customer } from '../customer/customer.entity';
import { Transaction } from '../transaction/transaction.entity';
import * as Sentry from '@sentry/node';

@Injectable()
export class AccountService {
  constructor(
      @InjectRepository(Account)
      private readonly accountRepository: Repository<Account>,
      @InjectRepository(Customer)
      private readonly customerRepository: Repository<Customer>,
      @InjectRepository(Transaction)
      private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(): Promise<Account[]> {
    try {
      return await this.accountRepository.find({ relations: ['customer'] });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Error fetching accounts');
    }
  }

  async findOne(id: number): Promise<Account> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id },
        relations: ['customer'],
      });
      if (!account) {
        throw new NotFoundException(`Account #${id} not found`);
      }
      return account;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Error fetching account');
    }
  }

  async createAccount(customerId: number, initialDeposit: number): Promise<Account> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const account = new Account();
      account.customer = customer;
      account.balance = initialDeposit;

      const createdAccount = await this.accountRepository.save(account);

      const transaction = new Transaction();
      transaction.account = createdAccount;
      transaction.amount = initialDeposit;
      transaction.type = 'DEPOSIT';

      await this.transactionRepository.save(transaction);

      return createdAccount;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Error creating account');
    }
  }

  async transfer(fromId: number, toId: number, amount: number): Promise<void> {
    const queryRunner = this.accountRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Fetching fromAccount');
      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: { id: fromId },
        lock: { mode: 'pessimistic_write' },
      });
      console.log('fromAccount:', fromAccount);

      console.log('Fetching toAccount');
      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { id: toId },
        lock: { mode: 'pessimistic_write' },
      });
      console.log('toAccount:', toAccount);

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('Account not found');
      }

      fromAccount.balance -= amount;
      toAccount.balance += amount;

      console.log('Saving fromAccount');
      await queryRunner.manager.save(fromAccount);

      console.log('Saving toAccount');
      await queryRunner.manager.save(toAccount);

      const fromTransaction = new Transaction();
      fromTransaction.account = fromAccount;
      fromTransaction.amount = -amount;
      fromTransaction.type = 'TRANSFER';

      const toTransaction = new Transaction();
      toTransaction.account = toAccount;
      toTransaction.amount = amount;
      toTransaction.type = 'TRANSFER';

      console.log('Saving fromTransaction');
      await queryRunner.manager.save(fromTransaction);

      console.log('Saving toTransaction');
      await queryRunner.manager.save(toTransaction);

      console.log('Committing transaction');
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error during transfer:', error);
      await queryRunner.rollbackTransaction();
      Sentry.captureException(error);
      throw new Error('Error transferring funds');
    } finally {
      await queryRunner.release();
    }
  }

  async transferBetweenUserAccounts(userId: number, toId: number, amount: number): Promise<void> {
    const queryRunner = this.accountRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userAccounts = await this.accountRepository.find({
        where: { customer: { id: userId } },
      });

      const fromAccount = userAccounts.find(account => account.balance >= amount);
      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { id: toId, customer: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('Account not found or insufficient funds');
      }

      fromAccount.balance -= amount;
      toAccount.balance += amount;

      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);

      const fromTransaction = new Transaction();
      fromTransaction.account = fromAccount;
      fromTransaction.amount = -amount;
      fromTransaction.type = 'TRANSFER';

      const toTransaction = new Transaction();
      toTransaction.account = toAccount;
      toTransaction.amount = amount;
      toTransaction.type = 'TRANSFER';

      await queryRunner.manager.save(fromTransaction);
      await queryRunner.manager.save(toTransaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Sentry.captureException(error);
      throw new Error('Error transferring funds');
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(accountId: number): Promise<number> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });
      if (!account) {
        throw new NotFoundException(`Account #${accountId} not found`);
      }
      return account.balance;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Error fetching account balance');
    }
  }

  async getTransferHistory(accountId: number): Promise<Transaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { account: { id: accountId } },
        relations: ['account'],
      });
      return transactions;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error('Error fetching transfer history');
    }
  }
}
