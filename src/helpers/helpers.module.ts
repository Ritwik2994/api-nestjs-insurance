import { Module } from '@nestjs/common';

import { HelpersService } from './helpers.service';
import { ResponseHandlerModel } from '../shared/model/response-handler.model';

@Module({
  providers: [HelpersService, ResponseHandlerModel]
})
export class HelpersModule {}
