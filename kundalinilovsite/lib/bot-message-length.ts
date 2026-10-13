import type { TContentPageKey } from "@/lib/admin-types";

export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const PRIVATE_SESSION_CONTACT_SUFFIX_PREFIX = "\n\nЗаписаться: ";

export function formatBotContentMessage(
  key: TContentPageKey,
  content: string,
  contactLink?: string,
): string {
  if (key === "private_session" && contactLink) {
    return `${content}${PRIVATE_SESSION_CONTACT_SUFFIX_PREFIX}${contactLink}`;
  }
  return content;
}

export function getBotContentMessageLength(
  key: TContentPageKey,
  content: string,
  contactLink?: string,
): number {
  return formatBotContentMessage(key, content, contactLink).length;
}

export function maxContentCharsForPage(key: TContentPageKey, contactLink?: string): number {
  if (key === "services") {
    return TELEGRAM_MESSAGE_MAX_LENGTH;
  }
  const link = contactLink?.trim() ?? "";
  const suffix = link ? `${PRIVATE_SESSION_CONTACT_SUFFIX_PREFIX}${link}` : "";
  return TELEGRAM_MESSAGE_MAX_LENGTH - suffix.length;
}
