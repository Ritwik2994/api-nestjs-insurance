import 'dotenv/config';

import { envSchema } from '../../shared/env-schema/env-schema';

export default async () => {
  return envSchema.validateAsync(process.env, { allowUnknown: true });
};
