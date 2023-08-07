import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { HelpersService } from '../../helpers/helpers.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user/user.module';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { AuthMongooseModule } from './schema/auth-token.schema';

@Module({
  imports: [
    ConfigModule,
    AuthMongooseModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRE') }
        };
      }
    })
  ],
  providers: [AuthService, HelpersService, ResponseHandlerModel],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
