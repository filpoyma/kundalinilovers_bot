import type { Context, NextFunction } from 'grammy';
import { CONSENT_PROMPT_TEXT } from '../../constants/consent.constants';
import { findOrCreateUser, hasAcceptedConsent } from '../../services/user.service';
import { getLegalDocumentInputFile } from '../../services/legal-documents.service';
import { consentKeyboard } from '../keyboards/consent.keyboard';
import {
  getPendingMenuAction,
  setPendingMenuAction,
  type TPendingMenuAction,
} from '../session/adminSession';
import { clearConsentMessagesFromChat, trackConsentMessage } from '../session/consentSession';

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
    await trackConsentMessage(ctx.from.id, message.chat.id, message.message_id);
  }
}

async function sendTrackedDocument(ctx: Context, type: 'terms' | 'privacy'): Promise<void> {
  const message = await ctx.replyWithDocument(getLegalDocumentInputFile(type));

  if (ctx.from) {
    await trackConsentMessage(ctx.from.id, message.chat.id, message.message_id);
  }
}

export async function ensureUser(ctx: Context, next: NextFunction): Promise<void> {
  if (ctx.from) {
    await findOrCreateUser(ctx);
  }
  await next();
}

export async function sendConsentPrompt(ctx: Context): Promise<void> {
  await sendTrackedDocument(ctx, 'terms');
  await sendTrackedDocument(ctx, 'privacy');
  await sendTrackedConsentMessage(ctx, CONSENT_PROMPT_TEXT, consentKeyboard());
}

export async function finalizeConsent(
  ctx: Context,
  onComplete: () => Promise<void>,
): Promise<void> {
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

  await setPendingMenuAction(from.id, action);
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

  const pending = await getPendingMenuAction(from.id);
  if (!pending) return false;

  return true;
}
