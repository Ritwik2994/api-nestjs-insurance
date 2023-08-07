import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().required()
});
