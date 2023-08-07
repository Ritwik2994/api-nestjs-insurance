import { Controller, Get, HttpStatus, Query, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FindAllClientDto } from './dto/find-all.dto';
import { GetRequest } from '../auth/decorators/get-user.decorator';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { ClientService } from './client.service';
import { ResponseMessage } from '../../shared/constants/ResponseMessage';

@Controller('client')
@ApiTags('Client Module')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly responseHandlerService: ResponseHandlerModel
  ) {}

  @ApiOperation({
    summary: 'Fetch single client by id'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-client')
  async fetchUser(@GetRequest() request, @Response() response): Promise<any> {
    const { id } = request.user;
    const data = await this.clientService.findOne(id);
    return this.responseHandlerService.response(data, HttpStatus.OK, response);
  }

  @ApiOperation({
    summary: 'Fetch all client'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-all')
  async fetchAllUser(@Query() findAllUserDto: FindAllClientDto, @Response() response): Promise<any> {
    const data = await this.clientService.findAll(findAllUserDto);
    return this.responseHandlerService.response(data, HttpStatus.OK, response);
  }
}
