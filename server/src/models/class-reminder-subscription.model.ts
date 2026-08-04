import { Schema, model, type Document, type Model, type Types } from 'mongoose';

export interface IClassReminderSubscription {
  telegramId: number;
  locationId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassReminderSubscriptionDocument extends IClassReminderSubscription, Document {}

const classReminderSubscriptionSchema = new Schema<IClassReminderSubscriptionDocument>(
  {
    telegramId: { type: Number, required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'OfflineLocation', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

classReminderSubscriptionSchema.index({ telegramId: 1, locationId: 1 }, { unique: true });

const ClassReminderSubscription: Model<IClassReminderSubscriptionDocument> =
  model<IClassReminderSubscriptionDocument>(
    'ClassReminderSubscription',
    classReminderSubscriptionSchema,
  );

export default ClassReminderSubscription;
