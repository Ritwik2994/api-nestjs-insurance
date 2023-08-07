import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { extendBaseSchema } from '../../../shared/schemas/base.schema';
import { UserRole } from '../../auth/enums/role.enum';
import { IUser } from '../interface/user.interface';

export const USER_MONGOOSE_PROVIDER = 'User';
export const USER_COLLECTION_NAME = 'users';

const UserSchema = extendBaseSchema(
  new Schema<IUser>(
    {
      email: { type: String, required: true, index: true },
      password: { type: String },
      role: { type: String, enum: Object.values(UserRole), default: UserRole.MANAGER, index: true },
      name: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      isBlocked: { type: Boolean, default: false },
      lastLoginTime: { type: Number, default: Date.now() }
    },
    { timestamps: true, versionKey: false }
  )
);

UserSchema.index({ name: 'text', email: 'text' });
UserSchema.index({ role: 'text', isActive: 'text', createdAt: 'text' });
export { UserSchema };

export const UserMongooseModule = MongooseModule.forFeature([
  { name: USER_MONGOOSE_PROVIDER, schema: UserSchema, collection: USER_COLLECTION_NAME }
]);
