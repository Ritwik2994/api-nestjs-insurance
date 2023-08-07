import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class ValidationFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    if (exception instanceof BadRequestException) {
      const response = host.switchToHttp().getResponse();
      response.status(exception.getStatus()).json(exception.getResponse());
    }
  }
}
