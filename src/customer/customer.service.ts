import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) {}

    async findAll(): Promise<Customer[]> {
        return this.customerRepository.find({ relations: ['accounts'] });
    }

    async findOne(id: number): Promise<Customer> {
        return this.customerRepository.findOne({
            where: { id },
            relations: ['accounts'],
        });
    }


    async create(customerData: Partial<Customer>): Promise<Customer> {
        const customer = this.customerRepository.create(customerData);
        return this.customerRepository.save(customer);
    }
}
