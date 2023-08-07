import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from '../auth.service';
import { ResponseMessage } from '../../../shared/constants/ResponseMessage';
import { IUser } from '../../user/interface/user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private reflector: Reflector) {}

  /**
   * @description Check if user is authorized and has the correct role.
   * @param {ExecutionContext} context - Execution context containing request information.
   * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating if the user is authorized and has the correct role.
   * @author Ritwik Rohitashwa
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    const req = context.switchToHttp().getRequest();

    if (isPublic) return true;

    const refreshTokenValidate = this.reflector.get<boolean>('useRefreshToken', context.getHandler());
    const authorizationHeader = req?.headers?.authorization;

    if (authorizationHeader) {
      const user = await this.validateToken(authorizationHeader, refreshTokenValidate);
      req['user'] = user;
      return !!user;
    }

    return false;
  }
  /**
   * @description Validate user token and extract user information.
   * @param {string} token - Token to be validated.
   * @returns {Promise<string>} - Returns a promise that resolves to a string having userId.
   * @author Ritwik Rohitashwa
   */
  async validateToken(bearerToken: string, refreshTokenValidate: boolean = false): Promise<IUser> {
    const [bearer, accessToken] = bearerToken.split(' ');
    if (!bearer?.startsWith('Bearer')) {
      throw new UnauthorizedException(ResponseMessage.JWT_TOKEN_MISSING);
    }
    return await this.authService.verifyAccessToken(accessToken, refreshTokenValidate);
  }
}

export const IsPublic = () => SetMetadata('isPublic', true);

export const UseRefreshToken = () => SetMetadata('useRefreshToken', true);
