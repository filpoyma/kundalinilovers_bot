import { Schema, model, type Document, type Model } from 'mongoose';

export interface IUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    termsAcceptedAt: { type: Date },
    privacyAcceptedAt: { type: Date },
  },
  { timestamps: true },
);

const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);

export default User;
