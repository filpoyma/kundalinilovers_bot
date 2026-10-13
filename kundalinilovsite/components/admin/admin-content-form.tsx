"use client";

import { useActionState, useState } from "react";
import { saveContentAction, type TSaveContentState } from "@/app/kundaliniadmin/(protected)/actions";
import {
  getBotContentMessageLength,
  TELEGRAM_MESSAGE_MAX_LENGTH,
} from "@/lib/bot-message-length";
import type { TContentPageKey } from "@/lib/admin-types";
import { AdminButton, AdminCard, AdminError } from "@/components/admin/admin-ui";

const fieldBaseClass =
  "mt-2 w-full rounded-[5px] border bg-[#111] px-3 py-2 normal-case text-[#f8f8f8] outline-none";

function fieldBorderClass(overLimit: boolean): string {
  if (overLimit) {
    return `${fieldBaseClass} border-[#ff6b6b] focus:border-[#ff6b6b]`;
  }
  return `${fieldBaseClass} border-[#929292]/60 focus:border-[#00ff95]`;
}

const initialSaveState: TSaveContentState = { ok: true };

export function AdminContentForm({
  contentKey,
  initialContent,
  initialContactLink = "",
}: {
  contentKey: TContentPageKey;
  initialContent: string;
  initialContactLink?: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [contactLink, setContactLink] = useState(initialContactLink);

  const [saveState, formAction, isPending] = useActionState(
    saveContentAction.bind(null, contentKey),
    initialSaveState,
  );

  const trimmedContent = content.trim();
  const trimmedLink = contactLink.trim();
  const botMessageLength = getBotContentMessageLength(
    contentKey,
    trimmedContent,
    trimmedLink || undefined,
  );
  const overLimit = botMessageLength > TELEGRAM_MESSAGE_MAX_LENGTH;

  const counterClass = overLimit ? "text-[#ff6b6b]" : "text-[#929292]";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (overLimit) {
      event.preventDefault();
    }
  }

  return (
    <AdminCard>
      <AdminError message={saveState.ok ? undefined : saveState.message} />
      <form action={formAction} onSubmit={handleSubmit}>
        <label className="mb-4 block">
          <span className="text-[#929292]">Текст</span>
          <textarea
            name="content"
            rows={12}
            required
            value={content}
            onChange={event => setContent(event.target.value)}
            className={fieldBorderClass(overLimit)}
          />
          <p
            className={`mt-2 normal-case text-[12px] leading-[16px] tracking-normal ${counterClass}`}
          >
            {botMessageLength} / {TELEGRAM_MESSAGE_MAX_LENGTH} символов в сообщении бота
          </p>
          {overLimit && (
            <p className="mt-1 normal-case text-[12px] leading-[16px] tracking-normal text-[#ff6b6b]">
              Сократите текст на {botMessageLength - TELEGRAM_MESSAGE_MAX_LENGTH} символов — иначе
              бот не сможет отправить это одним сообщением.
            </p>
          )}
        </label>

        {contentKey === "private_session" && (
          <label className="mb-4 block">
            <span className="text-[#929292]">Ссылка для записи</span>
            <input
              name="contactLink"
              type="text"
              value={contactLink}
              onChange={event => setContactLink(event.target.value)}
              placeholder="https://..."
              className={fieldBorderClass(false)}
            />
          </label>
        )}

        <AdminButton type="submit">{isPending ? "Сохранение…" : "Сохранить"}</AdminButton>
      </form>
    </AdminCard>
  );
}
