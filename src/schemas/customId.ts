import { Types } from 'mongoose';

export function objectIdValidator(value: any, helpers: any) {
  const isValidObjectId = Types.ObjectId.isValid(value);

  if (!isValidObjectId) {
    return helpers.message('Invalid id');
  }

  return value;
}
