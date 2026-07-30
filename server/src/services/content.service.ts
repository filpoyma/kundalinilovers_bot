import ContentPage from '../models/content-page.model';
import type { TContentPageKey } from '../types/schedule.types';

export async function getContentPage(key: TContentPageKey) {
  return ContentPage.findOne({ key });
}

export async function upsertContentPage(
  key: TContentPageKey,
  data: { content: string; contactLink?: string; updatedByTelegramId: number },
) {
  return ContentPage.findOneAndUpdate(
    { key },
    {
      content: data.content,
      contactLink: data.contactLink,
      updatedByTelegramId: data.updatedByTelegramId,
    },
    { upsert: true, new: true },
  );
}

export async function formatContentPage(key: TContentPageKey): Promise<string> {
  const page = await getContentPage(key);

  if (!page || !page.content) {
    if (key === 'services') {
      return 'Информация об услугах пока не добавлена.';
    }
    return 'Информация о личных сессиях пока не добавлена.';
  }

  let text = page.content;

  if (key === 'private_session' && page.contactLink) {
    text += `\n\nЗаписаться: ${page.contactLink}`;
  }

  return text;
}
