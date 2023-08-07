import { HttpStatus, Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { AppModule } from './app.module';
import { configureSwagger } from './shared/swagger/swagger';
import { HttpExceptionFilter } from './shared/core/httpException.filter';
import { csrfExcludeRoutes } from './shared/constants/constants';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const envApp = configService.get('NODE_ENV');
  const port = configService.get('NODE_PORT');
  const allowedDomains = configService.get('ALLOWED_DOMAINS');
  const whitelist = allowedDomains.split(',');
  app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'), {
    exclude: [{ path: 'health', method: RequestMethod.GET }]
  });
  app.use(cookieParser());

  /**
   * sets up CORS options depending on the environment, allowing all origins to connect in the development environment
   * and checking against a whitelist in other environments, and then applying the options using the cors middleware.
   */
  const corsOptions = {
    // Allow credentials to be sent with requests (cookies, authorization headers, etc.)
    credentials: true,
    // Define the allowed origins based on the environment
    origin:
      envApp === 'dev' || envApp === 'qa'
        ? '*'
        : function (origin, callback) {
            // If the origin is not in the whitelist, throw an error
            if (!origin || !whitelist.includes(origin)) {
              callback(new Error('Not allowed by CORS'));
            } else {
              callback(null, true);
            }
          },
    // Define the allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // Define the allowed headers
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  // Enable CORS with the defined options
  app.use(cors(corsOptions));

  /**
   * helmet middleware to set various security headers in a production environment.
   * It also sets a content security policy with custom directives to control which resources are allowed to be loaded.
   * Helmet will not work with playground, so if the env = production then playground should get disabled
   */
  if (envApp === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'", 'https://polyfill.io', 'https://*.cloudflare.com'],
            scriptSrc: ["'self'", 'https://polyfill.io', 'https://*.cloudflare.com'],
            styleSrc: ["'self'", 'https:'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            fontSrc: ["'self'", 'https:', 'data:'],
            childSrc: ["'self'", 'blob:'],
            frameSrc: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        expectCt: true,
        frameguard: true,
        hsts: true,
        hidePoweredBy: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: {
          permittedPolicies: 'by-content-type'
        },
        referrerPolicy: true,
        xssFilter: true
      })
    );
  }

  app.set('trust proxy', true);
  app.use(compression()); // Compression Settings

  const ignoreMethods =
    process.env.STAGE == 'dev'
      ? ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'POST', 'PATCH', 'PUT']
      : ['GET', 'HEAD', 'OPTIONS', 'DELETE'];

  // const csrfProtection = csurf({
  //   cookie: {
  //     httpOnly: true,
  //     secure: true,
  //     maxAge: 300
  //     // sameSite: 'none',
  //   },
  //   ignoreMethods
  // });
  // app.use((req, res, next) => {
  //   if (csrfExcludeRoutes.includes(req.path)) {
  //     return next();
  //   }
  //   csrfProtection(req, res, next);
  // });

  app.set('trust proxy', 1);

  app.use(hpp()); // Prevent http Parameter pollution
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.PRECONDITION_FAILED,
      whitelist: true,
      transform: true
    })
  );

  // swagger middleware
  if (['dev', 'staging', 'uat'].includes(envApp)) {
    configureSwagger(app);
  }

  await app.listen(port, () => {
    Logger.log(`${envApp} Server is running on ${port}`, `Application Server`);
  });
}
main();
