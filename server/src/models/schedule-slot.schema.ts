import { Schema } from 'mongoose';
import type { IScheduleSlot } from '../types/schedule.types';
import { isValidTimeHHmm } from '../utils/timeFormat';

function timeFieldValidator(value: string): boolean {
  return isValidTimeHHmm(value);
}

export const scheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: timeFieldValidator, message: 'Invalid startTime (expected HH:mm)' },
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      validate: { validator: timeFieldValidator, message: 'Invalid endTime (expected HH:mm)' },
    },
    title: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
);
