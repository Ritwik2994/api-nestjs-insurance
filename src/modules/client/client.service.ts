import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { CLIENT_MONGOOSE_PROVIDER } from './schema/client.schema';
import { IClient } from './interface/client.interface';
import { ResponseHandlerModel } from 'shared/model/response-handler.model';
import { HelpersService } from 'helpers/helpers.service';
import { ResponseMessage } from 'shared/constants/ResponseMessage';
import { UserResponse } from 'modules/user/interface/user-response.interface';
import { FindAllClientDto } from './dto/find-all.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(CLIENT_MONGOOSE_PROVIDER)
    private clientModel: Model<IClient>,
    private readonly configService: ConfigService,
    private readonly responseHandlerService: ResponseHandlerModel,
    private readonly helperService: HelpersService
  ) {}

  async create(data): Promise<IClient> {
    try {
      const { email } = data;
      const search = this.helperService.searchData(email);
      const clientExist = await this.clientModel.findOne({ email: search });

      if (clientExist) {
        return clientExist;
      }

      return await this.clientModel.create(data);
    } catch (error) {
      Logger.error(error.message, '[ERR-CREATE-CLIENT]');
    }
  }

  async findOne(id: string): Promise<IClient> {
    const client = await this.clientModel.findOne({ id });

    if (!client) {
      this.responseHandlerService.error(ResponseMessage.USER_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    return client;
  }

  async findAll(findAllClientDto: FindAllClientDto): Promise<UserResponse> {
    const { sortField, sortOrder, limit, search, nextPageToken } = findAllClientDto;
    const { query } = await this.helperService.makeQuery(nextPageToken);
    const sortCriteria = {};

    if (search) {
      const searchQuery = this.helperService.searchData(search);
      query['$or'] = [{ email: searchQuery }, { name: searchQuery }];
    }

    if (sortField) sortCriteria[sortField] = sortOrder || 'asc';

    const currentPageDocuments = await this.clientModel
      .find(query, { password: 0 })
      .sort(sortField ? sortCriteria : { createdAt: 'desc' })
      .limit(limit + 1);

    const nextPageDocuments = currentPageDocuments.slice(0, limit);
    const nextPageEncToken = await this.helperService.generateNextPageToken(currentPageDocuments, limit);

    return {
      nextPageToken: nextPageEncToken,
      results: nextPageDocuments
    };
  }
}
