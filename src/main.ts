// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// import { rateLimit } from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());
  // 1) Version all routes
  app.setGlobalPrefix('api/v1');

  // 2) Security headers
  app.use(helmet());

  // 3) CORS (after prefix so docs/CORS behave predictably)
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // 4) Cookie parser (for JWT in cookies)
  app.use(cookieParser());

  // 5) Rate limiting
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000,
  //     max: 100,
  //   }),
  // );

  // 6) Global validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 7) Swagger (only in dev/test)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SimpleAuthApp API')
      .setDescription('Auth & user management endpoints')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'accessToken')
      .build();

    // create the base document
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      ignoreGlobalPrefix: false,
    });

    // Note: will expose at /api/v1/docs
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  // 8) Graceful shutdown hooks
  app.enableShutdownHooks();

  // 9) Start listening
  const port = parseInt(process.env.PORT || '5001', 10) || 5001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
