import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

import config from './config';

const configService = new ConfigService(config);

/**
 * SecretsManager client
 */
const client = new AWS.SecretsManager({
  region: configService.get('AWS_REGION'),
  secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  accessKeyId: configService.get('AWS_ACCESS_KEY')
});

/**
 * AsyncLoadSecretsFromAWS
 * @description Asynchronously loads secrets from AWS Secrets Manager and stores them in the process environment.
 * @returns {Promise<void>}
 * @author Ritwik Rohitashwa
 */
export async function asyncLoadSecretsFromAWS(): Promise<void> {
  try {
    const secretName = configService.get('AWS_SECRET_ARN');
    const { SecretString } = await client.getSecretValue({ SecretId: secretName }).promise();
    const parsedSecrets = JSON.parse(SecretString);

    // Store secrets to process env
    Object.keys(parsedSecrets).forEach(function (key) {
      process.env[key] = parsedSecrets[key];
    });
  } catch (error) {
    Logger.error(error.message, 'ERROR: AWS-SECRET-MANAGER');
  }
}
