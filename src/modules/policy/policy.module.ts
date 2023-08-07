import { Module } from '@nestjs/common';

import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { PolicyMongooseModule } from './schema/policy.schema';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';

@Module({
  imports: [PolicyMongooseModule],
  controllers: [PolicyController],
  providers: [PolicyService, ResponseHandlerModel, HelpersService],
  exports: [PolicyService]
})
export class PolicyModule {}
