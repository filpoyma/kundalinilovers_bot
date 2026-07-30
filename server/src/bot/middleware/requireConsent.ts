import type { Context, NextFunction } from 'grammy';
import { findOrCreateUser, hasAcceptedConsent } from '../../services/user.service';
import { PRIVACY_TEXT, TERMS_TEXT } from '../../constants/consent.constants';
import { consentKeyboard } from '../keyboards/consent.keyboard';
import {
  getPendingMenuAction,
  setPendingMenuAction,
  type TPendingMenuAction,
} from '../session/adminSession';
import {
  clearConsentMessagesFromChat,
  trackConsentMessage,
} from '../session/consentSession';

const MENU_ACTIONS: TPendingMenuAction[] = [
  'menu:services',
  'menu:private_session',
  'menu:online_schedule',
  'menu:offline_schedule',
];

async function sendTrackedConsentMessage(
  ctx: Context,
  text: string,
  replyMarkup: ReturnType<typeof consentKeyboard>,
): Promise<void> {
  const message = await ctx.reply(text, { reply_markup: replyMarkup });

  if (ctx.from) {
    trackConsentMessage(ctx.from.id, message.chat.id, message.message_id);
  }
}

export async function ensureUser(ctx: Context, next: NextFunction): Promise<void> {
  if (ctx.from) {
    await findOrCreateUser(ctx);
  }
  await next();
}

export async function sendConsentPrompt(ctx: Context): Promise<void> {
  await sendTrackedConsentMessage(
    ctx,
    `Перед продолжением необходимо принять документы:\n\n${TERMS_TEXT}\n\n---\n\n${PRIVACY_TEXT}`,
    consentKeyboard(),
  );
}

export async function sendPrivacyConsentReminder(ctx: Context): Promise<void> {
  await sendTrackedConsentMessage(
    ctx,
    `Спасибо! Теперь примите политику конфиденциальности:\n\n${PRIVACY_TEXT}`,
    consentKeyboard(),
  );
}

export async function sendTermsConsentReminder(ctx: Context): Promise<void> {
  await sendTrackedConsentMessage(
    ctx,
    `Спасибо! Теперь примите пользовательское соглашение:\n\n${TERMS_TEXT}`,
    consentKeyboard(),
  );
}

export async function finalizeConsent(ctx: Context, onComplete: () => Promise<void>): Promise<void> {
  await clearConsentMessagesFromChat(ctx);
  await onComplete();
}

export async function requireConsentForMenu(
  ctx: Context,
  action: TPendingMenuAction,
  showContent: () => Promise<void>,
): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await findOrCreateUser(ctx);

  if (hasAcceptedConsent(user)) {
    await showContent();
    return;
  }

  setPendingMenuAction(from.id, action);
  await sendConsentPrompt(ctx);
}

export function isMenuAction(data: string): data is TPendingMenuAction {
  return MENU_ACTIONS.includes(data as TPendingMenuAction);
}

export async function handleConsentComplete(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from) return false;

  const user = await findOrCreateUser(ctx);
  if (!hasAcceptedConsent(user)) return false;

  const pending = getPendingMenuAction(from.id);
  if (!pending) return false;

  return true;
}
