"use client";

import { useActionState } from "react";
import { saveContentAction, type TSaveContentState } from "@/app/kundaliniadmin/(protected)/actions";
import type { TContentPageKey } from "@/lib/admin-types";
import { AdminButton, AdminCard, AdminError } from "@/components/admin/admin-ui";

const fieldClassName =
  "mt-2 w-full rounded-[5px] border border-[#929292]/60 bg-[#111] px-3 py-2 normal-case text-[#f8f8f8] outline-none focus:border-[#00ff95]";

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
  const [saveState, formAction, isPending] = useActionState(
    saveContentAction.bind(null, contentKey),
    initialSaveState,
  );

  return (
    <AdminCard>
      <AdminError message={saveState.ok ? undefined : saveState.message} />
      <form action={formAction}>
        <label className="mb-4 block">
          <span className="text-[#929292]">Текст</span>
          <textarea
            name="content"
            rows={12}
            required
            defaultValue={initialContent}
            className={fieldClassName}
          />
        </label>

        {contentKey === "private_session" && (
          <label className="mb-4 block">
            <span className="text-[#929292]">Ссылка для записи</span>
            <input
              name="contactLink"
              type="text"
              defaultValue={initialContactLink}
              placeholder="https://..."
              className={fieldClassName}
            />
          </label>
        )}

        <AdminButton type="submit">{isPending ? "Сохранение…" : "Сохранить"}</AdminButton>
      </form>
    </AdminCard>
  );
}
