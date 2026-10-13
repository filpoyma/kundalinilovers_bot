import { Schema, model, type Document, type Model, type Types } from 'mongoose';

export interface IClassReminderJob {
  telegramId: number;
  locationId: Types.ObjectId;
  slotId: Types.ObjectId;
  classStartsAt: Date;
  remindAt: Date;
  sentAt?: Date;
  lockedUntil?: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassReminderJobDocument extends IClassReminderJob, Document {}

const classReminderJobSchema = new Schema<IClassReminderJobDocument>(
  {
    telegramId: { type: Number, required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'OfflineLocation', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, required: true, index: true },
    classStartsAt: { type: Date, required: true },
    remindAt: { type: Date, required: true, index: true },
    sentAt: { type: Date, index: true },
    lockedUntil: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

classReminderJobSchema.index({ remindAt: 1, sentAt: 1 });
classReminderJobSchema.index(
  { telegramId: 1, locationId: 1, slotId: 1 },
  { unique: true, partialFilterExpression: { sentAt: { $exists: false } } },
);

const ClassReminderJob: Model<IClassReminderJobDocument> = model<IClassReminderJobDocument>(
  'ClassReminderJob',
  classReminderJobSchema,
);

export default ClassReminderJob;
