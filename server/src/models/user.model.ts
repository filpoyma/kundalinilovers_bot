import { Schema, model, type Document, type Model } from 'mongoose';

export interface IUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  consentAcceptedAt?: Date;
  timezone?: string;
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
    consentAcceptedAt: { type: Date },
    timezone: { type: String, trim: true },
  },
  { timestamps: true },
);

const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);

export default User;
