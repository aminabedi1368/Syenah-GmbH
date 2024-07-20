import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
    let controller: AccountController;
    let service: AccountService;

    const mockAccountService = {
        createAccount: jest.fn(),
        transfer: jest.fn(),
        getBalance: jest.fn(),
        getTransferHistory: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountController],
            providers: [
                {
                    provide: AccountService,
                    useValue: mockAccountService,
                },
            ],
        }).compile();

        controller = module.get<AccountController>(AccountController);
        service = module.get<AccountService>(AccountService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createAccount', () => {
        it('should create a new account', async () => {
            const customerId = 1;
            const initialDeposit = 1000;
            const newAccount = { id: 1, balance: initialDeposit, customer: { id: customerId, name: 'Test' } };

            mockAccountService.createAccount.mockResolvedValue(newAccount);

            expect(await controller.createAccount(customerId, initialDeposit)).toEqual(newAccount);
        });
    });

    describe('transfer', () => {
        it('should transfer amount between accounts', async () => {
            const fromId = 1;
            const toId = 2;
            const amount = 500;

            await controller.transfer(fromId, toId, amount);

            expect(mockAccountService.transfer).toHaveBeenCalledWith(fromId, toId, amount);
        });
    });

    describe('getBalance', () => {
        it('should return the balance of an account', async () => {
            const accountId = 1;
            const balance = 1000;

            mockAccountService.getBalance.mockResolvedValue(balance);

            expect(await controller.getBalance(accountId)).toEqual(balance);
        });
    });

    describe('getTransferHistory', () => {
        it('should return the transfer history of an account', async () => {
            const accountId = 1;
            const transferHistory = [{ id: 1, amount: 100, type: 'DEPOSIT' }];

            mockAccountService.getTransferHistory.mockResolvedValue(transferHistory);

            expect(await controller.getTransferHistory(accountId)).toEqual(transferHistory);
        });
    });
});
