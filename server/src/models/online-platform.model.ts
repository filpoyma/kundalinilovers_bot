import { Schema, model, type Document, type Model } from 'mongoose';
import type { IScheduleSlot } from '../types/schedule.types';
import { scheduleSlotSchema } from './schedule-slot.schema';

export interface IOnlinePlatform {
  platform: string;
  link: string;
  slots: IScheduleSlot[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOnlinePlatformDocument extends IOnlinePlatform, Document {}

const onlinePlatformSchema = new Schema<IOnlinePlatformDocument>(
  {
    platform: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    slots: { type: [scheduleSlotSchema], default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

onlinePlatformSchema.index({ sortOrder: 1 });

const OnlinePlatform: Model<IOnlinePlatformDocument> = model<IOnlinePlatformDocument>(
  'OnlinePlatform',
  onlinePlatformSchema,
);

export default OnlinePlatform;
