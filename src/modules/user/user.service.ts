import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRole } from '../auth/enums/role.enum';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { HelpersService } from '../../helpers/helpers.service';
import { ResponseMessage } from '../../shared/constants/ResponseMessage';
import { USER_MONGOOSE_PROVIDER } from './schema/user.schema';
import { IUser } from './interface/user.interface';
import { FindAllUserDto } from './dto/fetch-all-user.dto';
import { UserResponse } from './interface/user-response.interface';
import { AgentService } from '../agent/agent.service';
import { ClientService } from '../client/client.service';
import { PolicyService } from '../policy/policy.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MONGOOSE_PROVIDER)
    private userModel: Model<IUser>,
    private readonly configService: ConfigService,
    private readonly responseHandlerService: ResponseHandlerModel,
    private helperService: HelpersService,
    private readonly agentService: AgentService,
    private readonly clientService: ClientService,
    private readonly policyService: PolicyService
  ) {}

  async create(createUserInput: CreateUserDto): Promise<IUser> {
    const { email, name, password } = createUserInput;

    const search = this.helperService.searchData(email);
    const userExist = await this.userModel.findOne({ email: search, role: UserRole.MANAGER });

    if (userExist) {
      this.responseHandlerService.error(ResponseMessage.USER_ALREADY_EXIST, HttpStatus.CONFLICT);
    }

    return await this.userModel.create({
      email: email.toLowerCase(),
      password,
      name,
      role: UserRole.MANAGER
    });
  }

  async findOne(id: string): Promise<IUser> {
    const user = await this.userModel.findOne({ id });

    if (!user) {
      this.responseHandlerService.error(ResponseMessage.USER_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findOneByEmailAndRole(email: string, role: string): Promise<IUser> {
    const search = this.helperService.searchData(email);
    const user = await this.userModel.findOne({ email: search, role });

    if (user) return user;
    const message = role === UserRole.ADMIN ? ResponseMessage.ADMIN_NOT_EXIST : ResponseMessage.USER_NOT_EXIST;
    this.responseHandlerService.error(message, HttpStatus.NOT_FOUND);
  }

  async findAll(findAllUserDto: FindAllUserDto): Promise<UserResponse> {
    const { sortField, sortOrder, limit, search, nextPageToken } = findAllUserDto;
    const { query } = await this.helperService.makeQuery(nextPageToken);
    const sortCriteria = {};

    query['role'] = UserRole.MANAGER;

    if (search) {
      const searchQuery = this.helperService.searchData(search);
      query['$or'] = [{ email: searchQuery }, { name: searchQuery }];
    }

    if (sortField) sortCriteria[sortField] = sortOrder || 'asc';

    const currentPageDocuments = await this.userModel
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

  async uploadFile(file: Express.Multer.File): Promise<void> {
    const fileContent = file ? file.buffer.toString() : undefined;
    if (fileContent) {
      const data = await this.parseCsv(fileContent);
      await this.processData(data);
    }
  }

  /**
   * @description This is an async function that parses CSV content and returns an array of objects.
   * @param {string} content - A string containing the CSV data to be parsed.
   * @returns A Promise that resolves to an array of objects parsed from the CSV content.
   * @author Ritwik Rohitashwa
   */
  async parseCsv(content: string): Promise<any[]> {
    try {
      const results: any[] = [];

      const stream = Readable.from(content);

      return new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      Logger.error(error.message, '[ERR-PARSE-CSV]');
    }
  }

  async processData(datas: any[]): Promise<void> {
    try {
      const bulkOps = [];
      const agentCache = new Map();
      const clientCache = new Map();

      for (const data of datas) {
        let agent = agentCache.get(data.agent);
        if (!agent) {
          const slug = await this.helperService.makeUniqueSlug(data.agent);
          agent = await this.agentService.create({ slug, name: data.agent });
          agentCache.set(data.agent, agent);
        }

        const clientData = {
          agentId: new mongoose.Types.ObjectId(agent.id),
          userType: data.userType,
          email: data.email,
          gender: data.gender,
          firstName: data.firstname,
          phone: data.phone,
          dob: data.dob,
          location: {
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip
          }
        };

        let client = clientCache.get(clientData.email);
        if (!client) {
          client = await this.clientService.create(clientData);
          clientCache.set(clientData.email, client);
        }

        const dataToPush = {
          clientId: new mongoose.Types.ObjectId(client.id),
          policyMode: Number(data.policy_mode),
          producer: data.producer,
          policyNumber: data.policy_number,
          premiumAmountWritten: data.premium_amount_written,
          premiumAmount: Number(data.premium_amount),
          policyType: data.policy_type,
          companyName: data.company_name,
          categoryName: data.category_name,
          policyStartDate: data.policy_start_date,
          policyEndDate: data.policy_end_date,
          csr: data.csr,
          accountName: data.account_name,
          agencyId: data.agency_id
        };
        bulkOps.push({ insertOne: { document: dataToPush } });
      }

      await this.policyService.create(bulkOps);
    } catch (error) {
      Logger.error(error.message, '[ERR-PROCESS-DATA]');
    }
  }
}
