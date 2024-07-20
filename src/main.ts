import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import {
  BaseExceptionFilter,
  HttpAdapterHost,
  NestFactory,
} from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: process.env.DSN_SENTRY,
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with a specific allowed origin
  const allowedOrigin = process.env.FRONTEND_URL || 'http://95.216.43.126:8888';
  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set up Sentry error handler
  const { httpAdapter } = app.get(HttpAdapterHost);
  Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

  // Use validation pipe globally with custom error handling
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const validationErrors = errors.map((error) => ({
            field: error.property,
            constraints: error.constraints,
          }));
          return new BadRequestException({
            message: 'Validation failed',
            errors: validationErrors,
          });
        },
      }),
  );

  // Use global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply rate limiting
  app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT, 10) || 100,
      }),
  );

  // Apply helmet for security headers
  app.use(helmet());

  // Swagger setup
  const config = new DocumentBuilder()
      .setTitle('Financial API')
      .setDescription('The Financial API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
