import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from './base.schema';
import { IAppConfig } from './interface/app-config.interface';

export const APP_CONFIG_MONGOOSE_PROVIDER = 'app_config';

const AppConfigSchema = extendBaseSchema(
  new Schema<IAppConfig>(
    {
      key: { type: String, required: true, unique: true, index: true },
      value: { type: String, required: true },
      data: { type: JSON }
    },
    { timestamps: true, versionKey: false }
  )
);

AppConfigSchema.index({ key: 'text' });
export { AppConfigSchema };

export const AppConfigMongooseModule = MongooseModule.forFeature([
  { name: APP_CONFIG_MONGOOSE_PROVIDER, schema: AppConfigSchema }
]);
