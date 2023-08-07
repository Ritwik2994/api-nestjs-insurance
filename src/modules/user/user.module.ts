import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';
import { UserMongooseModule } from './schema/user.schema';
import { AgentModule } from '../agent/agent.module';
import { ClientModule } from '../client/client.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [UserMongooseModule, AgentModule, ClientModule, PolicyModule],
  controllers: [UserController],
  providers: [UserService, ResponseHandlerModel, HelpersService],
  exports: [UserService]
})
export class UsersModule {}
