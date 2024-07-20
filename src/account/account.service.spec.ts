import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';

describe('AccountService', () => {
    let service: AccountService;
    let repository: Repository<Account>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountService,
                {
                    provide: getRepositoryToken(Account),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<AccountService>(AccountService);
        repository = module.get<Repository<Account>>(getRepositoryToken(Account));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // تست‌های مربوطه را اینجا اضافه کنید
});
