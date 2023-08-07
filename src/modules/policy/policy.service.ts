import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { POLICY_MONGOOSE_PROVIDER } from './schema/policy.schema';
import { IPolicy } from './interface/policy.interface';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';
import { ResponseMessage } from '../../shared/constants/ResponseMessage';
import { UserResponse } from 'modules/user/interface/user-response.interface';
import { FindAllPolicyDto } from './dto/find-all.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(POLICY_MONGOOSE_PROVIDER)
    private policyModel: Model<IPolicy>,
    private readonly configService: ConfigService,
    private readonly responseHandlerService: ResponseHandlerModel,
    private helperService: HelpersService
  ) {}

  async create(bulkOps): Promise<void> {
    try {
      await this.policyModel.collection.bulkWrite(bulkOps);
    } catch (error) {
      Logger.error(error.message, '[ERR-CREATE-POLICY]');
    }
  }

  async findOne(id: string): Promise<IPolicy> {
    const client = await this.policyModel.findOne({ id });

    if (!client) {
      this.responseHandlerService.error(ResponseMessage.USER_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    return client;
  }

  async findAll(findAllPolicyDto: FindAllPolicyDto): Promise<UserResponse> {
    const { sortField, sortOrder, limit, search, nextPageToken } = findAllPolicyDto;
    const { query } = await this.helperService.makeQuery(nextPageToken);
    const sortCriteria = {};

    if (search) {
      const searchQuery = this.helperService.searchData(search);
      query['$or'] = [{ companyName: searchQuery }, { policyType: searchQuery }, { policyNumber: searchQuery }];
    }

    if (sortField) sortCriteria[sortField] = sortOrder || 'asc';

    const currentPageDocuments = await this.policyModel
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
