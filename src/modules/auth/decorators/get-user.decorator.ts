import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IUser } from 'modules/user/interface/user.interface';

export const GetRequest = createParamDecorator((_data, context: ExecutionContext): Promise<IUser> => {
  return context.switchToHttp().getRequest();
});
