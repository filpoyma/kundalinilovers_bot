import { Types } from 'mongoose';

export function parseObjectId(value: string): Types.ObjectId | null {
  if (!Types.ObjectId.isValid(value)) {
    return null;
  }

  const id = new Types.ObjectId(value);
  if (id.toString() !== value) {
    return null;
  }

  return id;
}
