import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

@Injectable()
export class XssMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request query and body using xss library
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (!obj) {
      return obj;
    }

    const sanitizedObject: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          sanitizedObject[key] = xss(value);
        } else if (typeof value === 'object') {
          sanitizedObject[key] = this.sanitizeObject(value);
        } else {
          sanitizedObject[key] = value;
        }
      }
    }
    return sanitizedObject;
  }
}
