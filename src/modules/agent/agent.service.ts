import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';

import { AGENT_MONGOOSE_PROVIDER } from './schema/agent.schema';
import { IAgent } from './interface/agent.interface';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';
import { ResponseMessage } from '../../shared/constants/ResponseMessage';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(AGENT_MONGOOSE_PROVIDER)
    private agentModel: Model<IAgent>,
    private readonly configService: ConfigService,
    private readonly responseHandlerService: ResponseHandlerModel,
    private helperService: HelpersService
  ) {}

  async create(data): Promise<IAgent> {
    try {
      const { slug, name } = data;

      const userExist = await this.agentModel.findOne({ slug });

      if (userExist) {
        return userExist;
      }

      return await this.agentModel.create({
        slug,
        name
      });
    } catch (error) {
      Logger.error(error.message, '[ERR-CREATE-AGENT]');
    }
  }

  async findOne(id: string): Promise<IAgent> {
    const client = await this.agentModel.findOne({ id });

    if (!client) {
      this.responseHandlerService.error(ResponseMessage.USER_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    return client;
  }
}
