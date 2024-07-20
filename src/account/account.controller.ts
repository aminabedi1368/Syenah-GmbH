import { Controller, Post, Body, Param, Get, BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
    private readonly logger = new Logger(AccountController.name);

    constructor(private readonly accountService: AccountService) {}

    @ApiOperation({ summary: 'Create a new account for a customer' })
    @ApiParam({ name: 'customerId', type: 'number', description: 'The ID of the customer' })
    @ApiBody({ schema: { type: 'object', properties: { initialDeposit: { type: 'number' } } } })
    @ApiResponse({ status: 201, description: 'Account created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post(':customerId')
    async createAccount(
        @Param('customerId') customerId: number,
        @Body('initialDeposit') initialDeposit: number,
    ) {
        return this.accountService.createAccount(customerId, initialDeposit);
    }

    @ApiOperation({ summary: 'Transfer amount between accounts' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fromId: { type: 'number' },
                toId: { type: 'number' },
                amount: { type: 'number' },
            },
            required: ['fromId', 'toId', 'amount']
        },
    })
    @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('transfer')
    async transfer(
        @Body('fromId') fromId: number,
        @Body('toId') toId: number,
        @Body('amount') amount: number,
    ) {
        this.logger.log(`Transfer request received: fromId: ${fromId}, toId: ${toId}, amount: ${amount}`);
        if (!fromId || !toId || !amount) {
            throw new BadRequestException('Invalid input data');
        }
        try {
            await this.accountService.transfer(fromId, toId, amount);
            return { message: 'Transfer completed successfully' };
        } catch (error) {
            this.logger.error('Error transferring funds:', error);
            throw error;
        }
    }


    @ApiOperation({ summary: 'Get the balance of an account' })
    @ApiParam({ name: 'accountId', type: 'number', description: 'The ID of the account' })
    @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Account not found' })
    @Get(':accountId/balance')
    async getBalance(@Param('accountId') accountId: number) {
        this.logger.log(`Getting balance for accountId: ${accountId}`);
        try {
            return this.accountService.getBalance(accountId);
        } catch (error) {
            this.logger.error('Error fetching balance:', error);
            throw error;
        }
    }

    @ApiOperation({ summary: 'Get the transfer history of an account' })
    @ApiParam({ name: 'accountId', type: 'number', description: 'The ID of the account' })
    @ApiResponse({ status: 200, description: 'Transfer history retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Account not found' })
    @Get(':accountId/transactions')
    async getTransferHistory(@Param('accountId') accountId: number) {
        this.logger.log(`Getting transfer history for accountId: ${accountId}`);
        try {
            return this.accountService.getTransferHistory(accountId);
        } catch (error) {
            this.logger.error('Error fetching transfer history:', error);
            throw error;
        }
    }
}
