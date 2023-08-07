import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from '../../../shared/schemas/base.schema';
import { IClient } from '../interface/client.interface';

export const CLIENT_MONGOOSE_PROVIDER = 'Client';
export const CLIENT_COLLECTION_NAME = 'clients';

export const Location = new Schema(
  {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String }
  },
  { _id: false, timestamps: false }
);

const ClientSchema = extendBaseSchema(
  new Schema<IClient>(
    {
      agentId: { type: Schema.Types.ObjectId, required: true },
      email: { type: String, required: true, index: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: false },
      phone: { type: String, required: false },
      gender: { type: String, required: false },
      userType: { type: String, required: false },
      dob: { type: Date, required: false },
      location: { type: Location },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true, versionKey: false }
  )
);

ClientSchema.index({ firstName: 'text', email: 'text' });
ClientSchema.index({ firstName: 'text', lastName: 'text' });
export { ClientSchema };

export const ClientMongooseModule = MongooseModule.forFeature([
  { name: CLIENT_MONGOOSE_PROVIDER, schema: ClientSchema, collection: CLIENT_COLLECTION_NAME }
]);
