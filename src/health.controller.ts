import { Controller, Get } from '@nestjs/common';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(private readonly connection: Connection) {}

    @Get()
    async check() {
        try {
            await this.connection.query('SELECT 1');
            return { status: 'Database connection is healthy' };
        } catch (error) {
            return { status: 'Database connection failed', error: error.message };
        }
    }
}
