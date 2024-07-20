import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Customer } from '../customer/customer.entity';
import { Transaction } from '../transaction/transaction.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Account, Customer, Transaction])],
    providers: [AccountService],
    controllers: [AccountController],
})
export class AccountModule {}
