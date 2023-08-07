import { Module, MiddlewareConsumer, NestModule, CacheModule, CacheInterceptor } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import config from './shared/config/config';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './shared/logger/logger.middleware';
import { loggerConfig } from './shared/logger/logger.config';
import { UsersModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggingInterceptor } from './shared/core/logging-interceptor';
import { HelpersModule } from './helpers/helpers.module';
import { AuthGuard } from './modules/auth/guards/auth.guards';
import { XssMiddleware } from './shared/core/xss-filter';
import { InputValidationMiddleware } from './shared/core/input-Validation.middleware';
import { AgentModule } from './modules/agent/agent.module';
import { ClientModule } from './modules/client/client.module';
import { PolicyModule } from './modules/policy/policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      }),
      inject: [ConfigService]
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT')
      })
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 24, //in seconds
      max: 60 * 60 * 24
    }),
    WinstonModule.forRoot(loggerConfig),
    UsersModule,
    AuthModule,
    HelpersModule,
    AgentModule,
    ClientModule,
    PolicyModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(middleware: MiddlewareConsumer) {
    middleware.apply(LoggerMiddleware, XssMiddleware, InputValidationMiddleware).forRoutes('/');
  }
}
