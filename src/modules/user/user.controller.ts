import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Response,
  Request,
  Query,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResponseMessage } from '../../shared/constants/ResponseMessage';
import { UserService } from './user.service';
import { GetRequest } from '../auth/decorators/get-user.decorator';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { IsPublic } from '../auth/guards/auth.guards';
import { FindAllUserDto } from './dto/fetch-all-user.dto';
import { UploadDto } from './dto/upload.dto';
import { ParseFilePipeBuilder } from '../../shared/core/parse-file-pipe-builder';

@Controller('user')
@ApiTags('User Module')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandlerService: ResponseHandlerModel
  ) {}

  @ApiOperation({
    summary: 'Fetch user data'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-user')
  async fetchUser(@GetRequest() request, @Response() response): Promise<any> {
    const { id } = request.user;
    const user = await this.userService.findOne(id);
    delete user.password;
    return this.responseHandlerService.response(user, HttpStatus.OK, response);
  }

  @ApiOperation({
    summary: 'Fetch user all data'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Get('get-all')
  async fetchAllUser(@Query() findAllUserDto: FindAllUserDto, @Response() response): Promise<any> {
    const data = await this.userService.findAll(findAllUserDto);
    return this.responseHandlerService.response(data, HttpStatus.OK, response);
  }

  @ApiOperation({
    summary: 'Upload csv file'
  })
  @ApiBadRequestResponse({ description: ResponseMessage.DEVICE_SESSION_EXPIRED })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndPassValidation(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'csv'
        })
        .build({
          fileIsRequired: true
        })
    )
    file: Express.Multer.File,
    @Response() response
  ) {
    this.userService.uploadFile(file);
    return this.responseHandlerService.response(ResponseMessage.FILE_UPLOAD_SUCCESS, HttpStatus.OK, response);
  }
}
