import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const url = context.switchToHttp().getRequest().originalUrl;
    const now = Date.now();
    return next.handle().pipe(tap(() => Logger.log(url, `Response Time = ${Date.now() - now}ms`)));
  }
}
