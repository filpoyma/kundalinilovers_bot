import { Schema, model, type Document, type Model } from 'mongoose';
import type { TScheduleType } from '../types/schedule.types';

export interface ISchedulePage {
  type: TScheduleType;
  title: string;
  updatedAt: Date;
}

export interface ISchedulePageDocument extends ISchedulePage, Document {}

const schedulePageSchema = new Schema<ISchedulePageDocument>(
  {
    type: { type: String, required: true, unique: true, enum: ['online', 'offline'] },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

const SchedulePage: Model<ISchedulePageDocument> = model<ISchedulePageDocument>(
  'SchedulePage',
  schedulePageSchema,
);

export default SchedulePage;
