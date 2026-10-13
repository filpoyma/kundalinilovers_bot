import { Schema, model, type Document, type Model } from 'mongoose';
import type { TAdminFlow } from '../bot/session/adminSession';
import type { TPendingMenuAction } from '../bot/session/adminSession';

export interface IConsentMessageRef {
  chatId: number;
  messageId: number;
}

export interface IBotDialogState {
  telegramId: number;
  adminFlow: TAdminFlow;
  pendingMenuAction?: TPendingMenuAction;
  consentMessages: IConsentMessageRef[];
  updatedAt: Date;
  createdAt: Date;
}

export interface IBotDialogStateDocument extends IBotDialogState, Document {}

const consentMessageSchema = new Schema<IConsentMessageRef>(
  {
    chatId: { type: Number, required: true },
    messageId: { type: Number, required: true },
  },
  { _id: false },
);

const DIALOG_TTL_SECONDS = 24 * 60 * 60;

const botDialogStateSchema = new Schema<IBotDialogStateDocument>(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    adminFlow: { type: Schema.Types.Mixed, default: () => ({ step: 'idle' }) },
    pendingMenuAction: { type: String },
    consentMessages: { type: [consentMessageSchema], default: [] },
  },
  { timestamps: true },
);

botDialogStateSchema.index({ updatedAt: 1 }, { expireAfterSeconds: DIALOG_TTL_SECONDS });

const BotDialogState: Model<IBotDialogStateDocument> = model<IBotDialogStateDocument>(
  'BotDialogState',
  botDialogStateSchema,
);

export default BotDialogState;
