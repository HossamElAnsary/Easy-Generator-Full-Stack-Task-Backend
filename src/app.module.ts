import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Env, EnvSchema } from './config/env.validation';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>): Env => {
        // throws if parsing fails
        return EnvSchema.parse(config);
      },
      validationOptions: { abortEarly: true },
    }),
    LoggerModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/simpleAuthApp',
    ),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 20,
        },
      ],
    }),
    UsersModule,
    AuthModule,
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
