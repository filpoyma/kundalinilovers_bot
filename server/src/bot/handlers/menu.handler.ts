import type { Bot, Context } from 'grammy';
import { formatContentPage } from '../../services/content.service';
import { formatSchedule } from '../utils/formatSchedule';
import { isAdmin } from '../utils/isAdmin';
import { mainMenuKeyboard, backToMenuKeyboard, MENU_CALLBACKS } from '../keyboards/main.keyboard';
import { WELCOME_MESSAGE } from '../../constants/consent.constants';
import { requireConsentForMenu, handleConsentComplete } from '../middleware/requireConsent';
import {
  clearPendingMenuAction,
  getPendingMenuAction,
} from '../session/adminSession';
import { acceptPrivacy, acceptTerms, findOrCreateUser } from '../../services/user.service';
import { consentKeyboard } from '../keyboards/consent.keyboard';
import { TERMS_TEXT, PRIVACY_TEXT } from '../../constants/consent.constants';

async function showServices(ctx: Context, mode: 'edit' | 'reply' = 'edit'): Promise<void> {
  const text = await formatContentPage('services');
  const markup = { reply_markup: backToMenuKeyboard() };
  if (mode === 'edit' && ctx.callbackQuery) {
    await ctx.editMessageText(text, markup);
  } else {
    await ctx.reply(text, markup);
  }
}

async function showPrivateSession(ctx: Context, mode: 'edit' | 'reply' = 'edit'): Promise<void> {
  const text = await formatContentPage('private_session');
  const markup = { reply_markup: backToMenuKeyboard() };
  if (mode === 'edit' && ctx.callbackQuery) {
    await ctx.editMessageText(text, markup);
  } else {
    await ctx.reply(text, markup);
  }
}

async function showOnlineSchedule(ctx: Context, mode: 'edit' | 'reply' = 'edit'): Promise<void> {
  const { text } = await formatSchedule('online');
  const markup = { reply_markup: backToMenuKeyboard() };
  if (mode === 'edit' && ctx.callbackQuery) {
    await ctx.editMessageText(text, markup);
  } else {
    await ctx.reply(text, markup);
  }
}

async function showOfflineSchedule(ctx: Context, mode: 'edit' | 'reply' = 'edit'): Promise<void> {
  const { text, parseMode } = await formatSchedule('offline', { linkAddresses: true });
  const markup = {
    reply_markup: backToMenuKeyboard(),
    ...(parseMode && {
      parse_mode: parseMode,
      link_preview_options: { is_disabled: true },
    }),
  };
  if (mode === 'edit' && ctx.callbackQuery) {
    await ctx.editMessageText(text, markup);
  } else {
    await ctx.reply(text, markup);
  }
}

async function showMainMenu(ctx: Context): Promise<void> {
  const admin = ctx.from ? isAdmin(ctx.from.id) : false;
  await ctx.editMessageText(WELCOME_MESSAGE, {
    reply_markup: mainMenuKeyboard(admin),
  });
}

async function executePendingAction(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const pending = getPendingMenuAction(from.id);
  if (!pending) return;

  clearPendingMenuAction(from.id);

  switch (pending) {
    case MENU_CALLBACKS.SERVICES:
      await showServices(ctx, 'reply');
      break;
    case MENU_CALLBACKS.PRIVATE_SESSION:
      await showPrivateSession(ctx, 'reply');
      break;
    case MENU_CALLBACKS.ONLINE_SCHEDULE:
      await showOnlineSchedule(ctx, 'reply');
      break;
    case MENU_CALLBACKS.OFFLINE_SCHEDULE:
      await showOfflineSchedule(ctx, 'reply');
      break;
  }
}

export function registerMenuHandler(bot: Bot): void {
  bot.callbackQuery(MENU_CALLBACKS.MAIN, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMainMenu(ctx);
  });

  bot.callbackQuery(MENU_CALLBACKS.SERVICES, async (ctx) => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.SERVICES, () => showServices(ctx));
  });

  bot.callbackQuery(MENU_CALLBACKS.PRIVATE_SESSION, async (ctx) => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.PRIVATE_SESSION, () =>
      showPrivateSession(ctx),
    );
  });

  bot.callbackQuery(MENU_CALLBACKS.ONLINE_SCHEDULE, async (ctx) => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.ONLINE_SCHEDULE, () =>
      showOnlineSchedule(ctx),
    );
  });

  bot.callbackQuery(MENU_CALLBACKS.OFFLINE_SCHEDULE, async (ctx) => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.OFFLINE_SCHEDULE, () =>
      showOfflineSchedule(ctx),
    );
  });

  bot.callbackQuery('consent:terms', async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    await acceptTerms(ctx.from.id);
    const user = await findOrCreateUser(ctx);

    if (!user.termsAcceptedAt) {
      await ctx.reply('Ошибка при сохранении согласия.');
      return;
    }

    if (!user.privacyAcceptedAt) {
      await ctx.reply(`Спасибо! Теперь примите политику конфиденциальности:\n\n${PRIVACY_TEXT}`, {
        reply_markup: consentKeyboard(),
      });
      return;
    }

    if (await handleConsentComplete(ctx)) {
      await ctx.reply('Спасибо! Открываю выбранный раздел...');
      await executePendingAction(ctx);
    }
  });

  bot.callbackQuery('consent:privacy', async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    await acceptPrivacy(ctx.from.id);
    const user = await findOrCreateUser(ctx);

    if (!user.privacyAcceptedAt) {
      await ctx.reply('Ошибка при сохранении согласия.');
      return;
    }

    if (!user.termsAcceptedAt) {
      await ctx.reply(`Спасибо! Теперь примите пользовательское соглашение:\n\n${TERMS_TEXT}`, {
        reply_markup: consentKeyboard(),
      });
      return;
    }

    if (await handleConsentComplete(ctx)) {
      await ctx.reply('Спасибо! Открываю выбранный раздел...');
      await executePendingAction(ctx);
    }
  });
}
