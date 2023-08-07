import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from '../../../shared/schemas/base.schema';
import { IPolicy } from '../interface/policy.interface';

export const POLICY_MONGOOSE_PROVIDER = 'Policy';
export const POLICY_COLLECTION_NAME = 'policies';

const PolicySchema = extendBaseSchema(
  new Schema<IPolicy>(
    {
      clientId: { type: Schema.Types.ObjectId, required: true },
      policyMode: { type: Number, required: true, index: false },
      producer: { type: String, required: false },
      policyNumber: { type: String, required: false },
      premiumAmountWritten: { type: String, required: false },
      premiumAmount: { type: Number, required: false },
      policyType: { type: String, required: false },
      companyName: { type: String, required: false },
      categoryName: { type: String, required: false },
      policyStartDate: { type: Date, required: true },
      policyEndDate: { type: Date, required: true },
      csr: { type: String, required: false },
      accountName: { type: String, required: false },
      agencyId: { type: String, required: false },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true, versionKey: false }
  )
);

PolicySchema.index({ firstName: 'text', email: 'text' });
PolicySchema.index({ firstName: 'text', lastName: 'text' });
export { PolicySchema };

export const PolicyMongooseModule = MongooseModule.forFeature([
  { name: POLICY_MONGOOSE_PROVIDER, schema: PolicySchema, collection: POLICY_COLLECTION_NAME }
]);
