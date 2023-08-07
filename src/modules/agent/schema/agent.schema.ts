import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from '../../../shared/schemas/base.schema';
import { IAgent } from '../interface/agent.interface';

export const AGENT_MONGOOSE_PROVIDER = 'Agent';
export const AGENT_COLLECTION_NAME = 'agents';

const AgentSchema = extendBaseSchema(
  new Schema<IAgent>(
    {
      slug: { type: String, required: true, index: true },
      email: { type: String, required: false, index: false },
      name: { type: String, required: true },
      isActive: { type: Boolean, default: true }
    },
    { timestamps: true, versionKey: false }
  )
);

AgentSchema.index({ name: 'text', slug: 'text' });
export { AgentSchema };

export const AgentMongooseModule = MongooseModule.forFeature([
  { name: AGENT_MONGOOSE_PROVIDER, schema: AgentSchema, collection: AGENT_COLLECTION_NAME }
]);
