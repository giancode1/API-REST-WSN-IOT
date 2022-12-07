import { Types } from 'mongoose';

export function createObjectIdValidator(value: any) {
  return (helpers: any) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  };
}
