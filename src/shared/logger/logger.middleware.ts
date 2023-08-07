import { Injectable, NestMiddleware, Inject, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // private logger = new Logger('HTTP', { timestamp: true });
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  use(req: Request, res: Response, next: () => void): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      const msg = {
        type: 'HTTP',
        statusCode: statusCode,
        method,
        url: originalUrl,
        contentLength,
        ip,
        userAgent
      };

      if (statusCode.toString().match(/[4-5]/)) this.logger.error(msg);
      else this.logger.log('info', msg);
    });
    next();
  }
}
