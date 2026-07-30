import { Schema, model, type Document, type Model } from 'mongoose';
import type { TContentPageKey } from '../types/schedule.types';

export interface IContentPage {
  key: TContentPageKey;
  content: string;
  contactLink?: string;
  updatedByTelegramId?: number;
  updatedAt: Date;
}

export interface IContentPageDocument extends IContentPage, Document {}

const contentPageSchema = new Schema<IContentPageDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['services', 'private_session'],
    },
    content: { type: String, default: '' },
    contactLink: { type: String, trim: true },
    updatedByTelegramId: { type: Number },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

const ContentPage: Model<IContentPageDocument> = model<IContentPageDocument>(
  'ContentPage',
  contentPageSchema,
);

export default ContentPage;
