import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './user.entity';
import { Customer } from '../customer/customer.entity';
import * as bcrypt from 'bcrypt';
import * as Sentry from '@sentry/node';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) {
    }

    async createUser(name: string, username: string, email: string, password: string): Promise<User> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const customer = this.customerRepository.create({ name });
            await this.customerRepository.save(customer);
            const user = this.userRepository.create({ name, username, email, password: hashedPassword, customer });
            return await this.userRepository.save(user);
        } catch (error) {
            Sentry.captureException(error); // ارسال خطا به Sentry
            console.error('Error saving user:', error); // لاگ کردن خطا
            throw new InternalServerErrorException('Error creating user'); // ارسال خطای 500 با پیغام مشخص
        }
    }

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email }, relations: ['customer'] });
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }, relations: ['customer'] });
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return user;
    }

    async findOne(username: string): Promise<User> {
        return this.userRepository.findOne({ where: { username }, relations: ['customer'] });
    }

    async findByUsername(username: string): Promise<User> {
        return this.userRepository.findOne({ where: { username }, relations: ['customer'] });
    }

}
