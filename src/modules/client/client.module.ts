import { Module } from '@nestjs/common';

import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { HelpersService } from '../../helpers/helpers.service';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { ClientMongooseModule } from './schema/client.schema';

@Module({
  imports: [ClientMongooseModule],
  controllers: [ClientController],
  providers: [ClientService, ResponseHandlerModel, HelpersService],
  exports: [ClientService]
})
export class ClientModule {}
