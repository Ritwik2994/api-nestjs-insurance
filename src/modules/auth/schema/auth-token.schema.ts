import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from '../../../shared/schemas/base.schema';
import { IAuthToken } from '../interfaces/auth.interface';

export const AUTH_TOKEN_MONGOOSE_PROVIDER = 'AuthToken';
export const AUTH_TOKEN_COLLECTION_NAME = 'auth-tokens';

export const AuthTokenSchema = extendBaseSchema(
  new Schema<IAuthToken>(
    {
      userId: { type: String, required: true },
      authToken: { type: String, required: true, unique: true, index: true },
      refreshToken: { type: String, required: true, unique: true, index: true },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true, versionKey: false }
  )
);

export const AuthMongooseModule = MongooseModule.forFeature([
  { name: AUTH_TOKEN_MONGOOSE_PROVIDER, schema: AuthTokenSchema, collection: AUTH_TOKEN_COLLECTION_NAME }
]);
