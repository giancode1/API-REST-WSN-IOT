import { Types } from 'mongoose';

export function objectIdValidator(value: any) {
  return (helpers: any) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error('Invalid Id');
    }
    return value;
  };
}
