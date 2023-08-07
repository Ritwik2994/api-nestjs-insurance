import { Controller, Get, HttpStatus, Query, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from '../../shared/constants/ResponseMessage';
import { PolicyService } from './policy.service';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { GetRequest } from '../auth/decorators/get-user.decorator';
import { FindAllPolicyDto } from './dto/find-all.dto';

@Controller('policy')
@ApiTags('Policy Module')
export class PolicyController {
  constructor(
    private readonly policyService: PolicyService,
    private readonly responseHandlerService: ResponseHandlerModel
  ) {}

  @ApiOperation({
    summary: 'Fetch single policy by id'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-policy')
  async fetchUser(@GetRequest() request, @Response() response): Promise<any> {
    const { id } = request.user;
    const data = await this.policyService.findOne(id);
    return this.responseHandlerService.response(data, HttpStatus.OK, response);
  }

  @ApiOperation({
    summary: 'Fetch all policies'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-all')
  async fetchAllUser(@Query() findAllPolicyDto: FindAllPolicyDto, @Response() response): Promise<any> {
    const data = await this.policyService.findAll(findAllPolicyDto);
    return this.responseHandlerService.response(data, HttpStatus.OK, response);
  }
}
