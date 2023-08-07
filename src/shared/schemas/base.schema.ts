import mongoose, { Schema } from 'mongoose';

const BaseSchema = (): Schema => {
  return new mongoose.Schema(
    {},
    {
      strict: false,
      toObject: {
        transform: (doc, ret) => {
          ret.id = ret._id;
          delete ret._id;
        }
      },
      toJSON: {
        transform: (doc, ret) => {
          ret.id = ret._id;
          delete ret._id;
        }
      }
    }
  );
};

export const extendBaseSchema = (schema: Schema): Schema => {
  schema.set('strict', false);
  schema.set('toObject', { virtuals: true });
  schema.set('toJSON', { virtuals: true });
  schema.plugin(BaseSchema);
  return schema;
};
