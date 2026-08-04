import type { Context } from 'grammy';
import User, { type IUserDocument } from '../models/user.model';

export async function findOrCreateUser(ctx: Context): Promise<IUserDocument> {
  const from = ctx.from;
  if (!from) {
    throw new Error('No user in context');
  }

  const existing = await User.findOne({ telegramId: from.id });
  if (existing) {
    existing.username = from.username;
    existing.firstName = from.first_name;
    existing.lastName = from.last_name;
    await existing.save();
    return existing;
  }

  return User.create({
    telegramId: from.id,
    username: from.username,
    firstName: from.first_name,
    lastName: from.last_name,
  });
}

export async function findUserByTelegramId(telegramId: number): Promise<IUserDocument | null> {
  return User.findOne({ telegramId });
}

export function hasAcceptedConsent(user: IUserDocument): boolean {
  return Boolean(user.consentAcceptedAt);
}

export async function acceptConsent(telegramId: number): Promise<IUserDocument | null> {
  return User.findOneAndUpdate(
    { telegramId },
    { consentAcceptedAt: new Date() },
    { new: true },
  );
}

export async function setUserTimezone(
  telegramId: number,
  timezone: string,
): Promise<IUserDocument | null> {
  return User.findOneAndUpdate({ telegramId }, { timezone }, { new: true });
}
