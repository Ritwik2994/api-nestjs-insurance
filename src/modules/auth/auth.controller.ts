import { Body, Controller, HttpStatus, Post, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ResponseMessage } from '../../shared/constants/ResponseMessage';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';
import { UserRole } from './enums/role.enum';
import { IsPublic } from './guards/auth.guards';

@Controller('auth')
@ApiTags('Auth Module')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandlerService: ResponseHandlerModel
  ) {}

  @ApiOperation({
    summary: 'Sign up a new user'
  })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @IsPublic()
  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto, @Response() response): Promise<any> {
    const { user, accessToken, refreshToken } = await this.authService.signUp(createUserDto);
    return this.responseHandlerService.response({ user, accessToken, refreshToken }, HttpStatus.CREATED, response);
  }

  @ApiOperation({
    summary: 'Login User'
  })
  @ApiConflictResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR
  })
  @IsPublic()
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Response() response): Promise<any> {
    loginDto.role = UserRole.MANAGER;
    const { user, accessToken, refreshToken } = await this.authService.signIn(loginDto);
    return this.responseHandlerService.response({ user, accessToken, refreshToken }, HttpStatus.OK, response);
  }
}
