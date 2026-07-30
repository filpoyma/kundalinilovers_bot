import { Schema, model, type Document, type Model } from 'mongoose';
import type { IScheduleSlot } from '../types/schedule.types';
import { scheduleSlotSchema } from './schedule-slot.schema';

export interface IOfflineLocation {
  country: string;
  city: string;
  address: string;
  slots: IScheduleSlot[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOfflineLocationDocument extends IOfflineLocation, Document {}

const offlineLocationSchema = new Schema<IOfflineLocationDocument>(
  {
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    slots: { type: [scheduleSlotSchema], default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

offlineLocationSchema.index({ sortOrder: 1 });

const OfflineLocation: Model<IOfflineLocationDocument> = model<IOfflineLocationDocument>(
  'OfflineLocation',
  offlineLocationSchema,
);

export default OfflineLocation;
