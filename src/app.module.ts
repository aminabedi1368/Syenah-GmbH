import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {APP_FILTER} from '@nestjs/core';
import {AccountModule} from './account/account.module';
import {AuthModule} from './auth/auth.module';
import {CustomerModule} from './customer/customer.module';
import {HttpExceptionFilter} from './filters/http-exception.filter';
import {UsersModule} from './users/users.module';
import {AppController} from './app.controller';
import { AppService } from './app.service';
import {HealthController} from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'database.sqlite',
            autoLoadEntities: true,
            synchronize: true,
        }),
        AccountModule,
        AuthModule,
        CustomerModule,
        UsersModule,
    ],
    controllers: [
        AppController,
        HealthController
    ],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {
}
