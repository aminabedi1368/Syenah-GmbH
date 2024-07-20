import {BadRequestException, Body, Controller, InternalServerErrorException,UnauthorizedException, Post} from '@nestjs/common';
import {UsersService} from './users.service';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class UserController {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
    }

    @ApiOperation({summary: 'Register a new user'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: {type: 'string'},
                username: {type: 'string'},
                email: {type: 'string'},
                password: {type: 'string'},
            },
        },
    })
    @ApiResponse({status: 201, description: 'User registered successfully'})
    @ApiResponse({status: 400, description: 'Username already exists'})
    @Post('register')
    async register(
        @Body('name') name: string,
        @Body('username') username: string,
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        const secret = this.configService.get<string>('JWT_SECRET');

        // Check if the username already exists
        const existingUser = await this.userService.findByUsername(username);
        const existingEmail = await this.userService.findByUsername(email);

        if (existingUser) {
            throw new BadRequestException('Username already exists');
        }
        if (existingEmail) {
            throw new BadRequestException('email already exists');
        }
        // Create the new user
        const user = await this.userService.createUser(name, username, email, password);

        try {
            // Generate a JWT token
            const payload = {sub: user.id, email: user.email};
            // const token = this.jwtService.sign(payload);
            return {
                user,
                access_token: await this.jwtService.signAsync(payload, { secret:secret }),//
            }
        } catch (error) {
            console.error('Error generating token:', error); // Log the error
            throw new InternalServerErrorException('Error generating token'); // Send a 500 error with a specific message
        }
    }

    @ApiOperation({summary: 'Login a user'})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {type: 'string'},
                password: {type: 'string'},
            },
        },
    })
    @ApiResponse({status: 200, description: 'User logged in successfully'})
    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        const secret = this.configService.get<string>('JWT_SECRET');
        const user = await this.userService.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        try {
            // Generate a JWT token
            const payload = {sub: user.id, email: user.email};
            return {
                user,
                access_token: await this.jwtService.signAsync(payload, { secret: secret}),//
            }
        } catch (error) {
            console.error('Error generating token:', error); // Log the error
            throw new InternalServerErrorException('Error generating token'); // Send a 500 error with a specific message
        }
    }
}
