import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './user.entity';
import { Customer } from '../customer/customer.entity';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Customer]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [UserController],
    providers: [UsersService, JwtStrategy],
    exports: [UsersService],
})
export class UsersModule {}
