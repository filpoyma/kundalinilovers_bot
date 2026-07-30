import type { Context, NextFunction } from 'grammy';
import { findOrCreateUser, hasAcceptedConsent } from '../../services/user.service';
import { PRIVACY_TEXT, TERMS_TEXT } from '../../constants/consent.constants';
import { consentKeyboard } from '../keyboards/consent.keyboard';
import {
  getPendingMenuAction,
  setPendingMenuAction,
  type TPendingMenuAction,
} from '../session/adminSession';

const MENU_ACTIONS: TPendingMenuAction[] = [
  'menu:services',
  'menu:private_session',
  'menu:online_schedule',
  'menu:offline_schedule',
];

export async function ensureUser(ctx: Context, next: NextFunction): Promise<void> {
  if (ctx.from) {
    await findOrCreateUser(ctx);
  }
  await next();
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

  await ctx.reply(
    `Перед продолжением необходимо принять документы:\n\n${TERMS_TEXT}\n\n---\n\n${PRIVACY_TEXT}`,
    { reply_markup: consentKeyboard() },
  );
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
