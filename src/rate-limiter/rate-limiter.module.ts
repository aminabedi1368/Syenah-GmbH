import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

@Module({})
export class RateLimiterModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                rateLimit({
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100, // limit each IP to 100 requests per windowMs
                }),
            )
            .forRoutes('*');
    }
}
