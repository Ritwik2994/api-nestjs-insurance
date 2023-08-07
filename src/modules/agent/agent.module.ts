import { Module } from '@nestjs/common';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';
import { AgentMongooseModule } from './schema/agent.schema';

@Module({
  imports: [AgentMongooseModule],
  controllers: [AgentController],
  providers: [AgentService, ResponseHandlerModel, HelpersService],
  exports: [AgentService]
})
export class AgentModule {}
