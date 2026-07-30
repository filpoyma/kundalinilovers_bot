import { Schema } from 'mongoose';
import type { IScheduleSlot } from '../types/schedule.types';

export const scheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
);
