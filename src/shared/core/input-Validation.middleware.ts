import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import xss from 'xss';

@Injectable()
export class InputValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query) {
      this.customInputValidation(req);
    }

    if (req.body) {
      this.customInputValidation(req);
    }

    next();
  }

  private customInputValidation(request: any) {
    try {
      const requestMethod: string = request.method;
      this.validateRequestUrl(request);
      let error: any = {};

      if (requestMethod === 'GET') {
        error = this.processGetRequest(request);
      } else if (['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
        error = this.processPostRequest(request);
      }

      if (error && Object.keys(error).length && error['errorStatus']) {
        this.rejectRequest(error);
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }

  private validateRequestUrl(request: any) {
    const requestUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    if (requestUrl !== null && requestUrl !== undefined) {
      const validatedUrlRes = this.findInjection({ request_url: requestUrl });
      if (validatedUrlRes && Object.keys(validatedUrlRes).length && validatedUrlRes['errorStatus'])
        this.rejectRequest(validatedUrlRes);
    }
  }

  private rejectRequest(error: any) {
    const errMessage = `Invalid content passed on ${error['requestKey']}`;
    throw new HttpException(errMessage, HttpStatus.FORBIDDEN);
  }

  private processGetRequest(request: any) {
    let error: any = {};
    const request_query = request.query;
    if (request_query && Object.keys(request_query).length) {
      error = this.findInjection(request_query);
      request.query = error['sanitizedObject'];
    }
    return error;
  }

  private processPostRequest(request: any) {
    let error: any = {};
    const bodyParams = request.body;

    if (bodyParams && Object.keys(bodyParams).length && !Array.isArray(bodyParams)) {
      error = this.findInjection(bodyParams);
      request.body = error.sanitizedObject;
    }

    if (Array.isArray(bodyParams) && bodyParams.length) {
      for (let i = 0; i < bodyParams.length; i++) {
        error = this.findInjection(bodyParams[i]);
        request.body[i] = error['sanitizedObject'];
        if (error && Object.keys(error).length && error['errorStatus'] === true) {
          break;
        }
      }
    }
    return error;
  }

  private findInjection(inputParams: any) {
    let error: any = {};
    for (const key in inputParams) {
      if (
        inputParams.hasOwnProperty(key) &&
        (typeof inputParams[key] === 'string' || typeof inputParams[key] === 'boolean')
      ) {
        let keyValue = String(inputParams[key]).replace(/%20/g, ' ');
        if (typeof inputParams[key] === 'string') {
          const sanitizedValue = this.sanitizeUrl(keyValue);
          const noHtmlString = xss(sanitizedValue); // XSS protection
          inputParams[key] = noHtmlString;
          error.errorStatus = this.applyInjectionRule(noHtmlString); // SQL injection protection
        }
        error = {
          requestKey: key,
          sanitizedObject: inputParams
        };
        if (error.errorStatus) {
          break;
        }
      }
    }

    return error;
  }

  private applyInjectionRule(input: string) {
    /* sql injection validation */
    const sql = new RegExp("w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))", 'i');
    const sqlMeta = new RegExp("(%27)|(')|(--)|(%23)|(#)", 'i');
    const sqlMetaVersion2 = new RegExp("((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))", 'i');
    const sqlUnion = new RegExp("((%27)|('))union", 'i');
    /* sql injection validation */

    /* cross site scripting validation */
    const xssSimple = new RegExp('((%3C)|<)((%2F)|/)*[a-z0-9%]+((%3E)|>)', 'i');
    const xssImgSrc = new RegExp('((%3C)|<)((%69)|i|(%49))((%6D)|m|(%4D))((%67)|g|(%47))[^\n]+((%3E)|>)', 'i');
    /* cross site scripting validation */

    return (
      sql.test(input) ||
      sqlMeta.test(input) ||
      sqlMetaVersion2.test(input) ||
      sqlUnion.test(input) ||
      xssSimple.test(input) ||
      xssImgSrc.test(input)
    );
  }

  private sanitizeUrl(url?: string): string {
    const allowedSchemes = ['http', 'https', 'ftp'];
    const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
    const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
    const urlSchemeRegex = /^([^:]+):/gm;
    if (!url) {
      return 'about:blank';
    }

    const sanitizedUrl = url.replace(ctrlCharactersRegex, '').trim();

    if (this.isRelativeUrlWithoutProtocol(sanitizedUrl)) {
      return sanitizedUrl;
    }

    const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);

    if (!urlSchemeParseResults) {
      return sanitizedUrl;
    }

    const urlScheme = urlSchemeParseResults[0];

    if (!allowedSchemes.includes(urlScheme) || invalidProtocolRegex.test(urlScheme)) {
      return 'about:blank';
    }

    return sanitizedUrl;
  }

  private isRelativeUrlWithoutProtocol(url: string): boolean {
    const relativeFirstCharacters = ['.', '/'];
    return relativeFirstCharacters.includes(url[0]);
  }
}
