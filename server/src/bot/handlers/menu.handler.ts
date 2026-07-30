import type { Bot, Context } from 'grammy';
import { formatContentPage } from '../../services/content.service';
import { formatSchedule } from '../utils/formatSchedule';
import { isAdmin } from '../utils/isAdmin';
import {
  getMenuActionByLabel,
  mainMenuReplyKeyboard,
  removeReplyKeyboardMarkup,
  MENU_CALLBACKS,
  type TMenuAction,
} from '../keyboards/main.keyboard';
import { adminMenuKeyboard } from '../keyboards/admin.keyboard';
import { WELCOME_MESSAGE } from '../../constants/consent.constants';
import { requireConsentForMenu, handleConsentComplete, sendConsentPrompt, finalizeConsent, sendPrivacyConsentReminder, sendTermsConsentReminder } from '../middleware/requireConsent';
import {
  clearAdminSession,
  clearPendingMenuAction,
  getAdminSession,
  getPendingMenuAction,
} from '../session/adminSession';
import {
  acceptPrivacy,
  acceptTerms,
  findOrCreateUser,
  hasAcceptedConsent,
} from '../../services/user.service';

async function showServices(ctx: Context): Promise<void> {
  const text = await formatContentPage('services');
  await ctx.reply(text);
}

async function showPrivateSession(ctx: Context): Promise<void> {
  const text = await formatContentPage('private_session');
  await ctx.reply(text);
}

async function showOnlineSchedule(ctx: Context): Promise<void> {
  const { text } = await formatSchedule('online');
  await ctx.reply(text);
}

async function showOfflineSchedule(ctx: Context): Promise<void> {
  const { text, parseMode } = await formatSchedule('offline', { linkAddresses: true });
  await ctx.reply(text, {
    ...(parseMode && {
      parse_mode: parseMode,
      link_preview_options: { is_disabled: true },
    }),
  });
}

async function sendWithMainMenuKeyboard(ctx: Context, text: string): Promise<void> {
  if (!ctx.from) return;
  await ctx.reply(text, {
    reply_markup: mainMenuReplyKeyboard(isAdmin(ctx.from.id)),
  });
}

async function showMainMenu(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const user = await findOrCreateUser(ctx);
  if (!hasAcceptedConsent(user)) {
    await ctx.reply(WELCOME_MESSAGE, { reply_markup: removeReplyKeyboardMarkup() });
    await sendConsentPrompt(ctx);
    return;
  }

  await sendWithMainMenuKeyboard(ctx, WELCOME_MESSAGE);
}

async function showAdminPanel(ctx: Context): Promise<void> {
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('У вас нет доступа к админ-панели.');
    return;
  }

  clearAdminSession(ctx.from.id);
  await ctx.reply('Админ-панель', { reply_markup: adminMenuKeyboard() });
}

async function handleMenuAction(ctx: Context, action: TMenuAction): Promise<void> {
  if (action === 'admin') {
    await showAdminPanel(ctx);
    return;
  }

  switch (action) {
    case MENU_CALLBACKS.SERVICES:
      await requireConsentForMenu(ctx, MENU_CALLBACKS.SERVICES, () => showServices(ctx));
      break;
    case MENU_CALLBACKS.PRIVATE_SESSION:
      await requireConsentForMenu(ctx, MENU_CALLBACKS.PRIVATE_SESSION, () =>
        showPrivateSession(ctx),
      );
      break;
    case MENU_CALLBACKS.ONLINE_SCHEDULE:
      await requireConsentForMenu(ctx, MENU_CALLBACKS.ONLINE_SCHEDULE, () =>
        showOnlineSchedule(ctx),
      );
      break;
    case MENU_CALLBACKS.OFFLINE_SCHEDULE:
      await requireConsentForMenu(ctx, MENU_CALLBACKS.OFFLINE_SCHEDULE, () =>
        showOfflineSchedule(ctx),
      );
      break;
  }
}

async function executePendingAction(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const pending = getPendingMenuAction(from.id);
  if (!pending) return;

  clearPendingMenuAction(from.id);

  switch (pending) {
    case MENU_CALLBACKS.SERVICES:
      await showServices(ctx);
      break;
    case MENU_CALLBACKS.PRIVATE_SESSION:
      await showPrivateSession(ctx);
      break;
    case MENU_CALLBACKS.ONLINE_SCHEDULE:
      await showOnlineSchedule(ctx);
      break;
    case MENU_CALLBACKS.OFFLINE_SCHEDULE:
      await showOfflineSchedule(ctx);
      break;
  }
}

export function registerMenuHandler(bot: Bot): void {
  bot.on('message:text', async (ctx, next) => {
    if (!ctx.from) return next();

    const adminSession = getAdminSession(ctx.from.id);
    if (adminSession.step !== 'idle') return next();

    const action = getMenuActionByLabel(ctx.message.text.trim());
    if (!action) return next();

    const user = await findOrCreateUser(ctx);
    if (!hasAcceptedConsent(user)) return next();

    await handleMenuAction(ctx, action);
  });

  bot.callbackQuery(MENU_CALLBACKS.MAIN, async ctx => {
    await ctx.answerCallbackQuery();
    await showMainMenu(ctx);
  });

  bot.callbackQuery(MENU_CALLBACKS.SERVICES, async ctx => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.SERVICES, () => showServices(ctx));
  });

  bot.callbackQuery(MENU_CALLBACKS.PRIVATE_SESSION, async ctx => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.PRIVATE_SESSION, () =>
      showPrivateSession(ctx),
    );
  });

  bot.callbackQuery(MENU_CALLBACKS.ONLINE_SCHEDULE, async ctx => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.ONLINE_SCHEDULE, () =>
      showOnlineSchedule(ctx),
    );
  });

  bot.callbackQuery(MENU_CALLBACKS.OFFLINE_SCHEDULE, async ctx => {
    await ctx.answerCallbackQuery();
    await requireConsentForMenu(ctx, MENU_CALLBACKS.OFFLINE_SCHEDULE, () =>
      showOfflineSchedule(ctx),
    );
  });

  bot.callbackQuery('consent:terms', async ctx => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    await acceptTerms(ctx.from.id);
    const user = await findOrCreateUser(ctx);

    if (!user.termsAcceptedAt) {
      await ctx.reply('Ошибка при сохранении согласия.');
      return;
    }

    if (!user.privacyAcceptedAt) {
      await sendPrivacyConsentReminder(ctx);
      return;
    }

    if (await handleConsentComplete(ctx)) {
      await finalizeConsent(ctx, async () => {
        await sendWithMainMenuKeyboard(ctx, 'Спасибо! Открываю выбранный раздел...');
        await executePendingAction(ctx);
      });
    } else if (hasAcceptedConsent(user)) {
      await finalizeConsent(ctx, async () => {
        await sendWithMainMenuKeyboard(ctx, 'Спасибо! Теперь вы можете выбрать раздел в меню.');
      });
    }
  });

  bot.callbackQuery('consent:privacy', async ctx => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;

    await acceptPrivacy(ctx.from.id);
    const user = await findOrCreateUser(ctx);

    if (!user.privacyAcceptedAt) {
      await ctx.reply('Ошибка при сохранении согласия.');
      return;
    }

    if (!user.termsAcceptedAt) {
      await sendTermsConsentReminder(ctx);
      return;
    }

    if (await handleConsentComplete(ctx)) {
      await finalizeConsent(ctx, async () => {
        await sendWithMainMenuKeyboard(ctx, 'Спасибо! Открываю выбранный раздел...');
        await executePendingAction(ctx);
      });
    } else if (hasAcceptedConsent(user)) {
      await finalizeConsent(ctx, async () => {
        await sendWithMainMenuKeyboard(ctx, 'Спасибо! Теперь вы можете выбрать раздел в меню.');
      });
    }
  });
}
