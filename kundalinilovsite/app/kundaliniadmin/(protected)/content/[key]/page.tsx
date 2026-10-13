import { notFound } from "next/navigation";
import { saveContentAction } from "@/app/kundaliniadmin/(protected)/actions";
import { AdminButton, AdminCard, AdminField, AdminShell } from "@/components/admin/admin-ui";
import { fetchContent } from "@/lib/admin-api";
import type { TContentPageKey } from "@/lib/admin-types";

const TITLES: Record<TContentPageKey, string> = {
  services: "Обо мне",
  private_session: "Личная сессия",
};

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key: rawKey } = await params;
  if (rawKey !== "services" && rawKey !== "private_session") {
    notFound();
  }
  const key = rawKey as TContentPageKey;
  const data = await fetchContent(key);

  return (
    <AdminShell title={TITLES[key]}>
      <AdminCard>
        <form action={saveContentAction.bind(null, key)}>
          <AdminField label="Текст" name="content" value={data.content} rows={12} required />
          {key === "private_session" && (
            <AdminField
              label="Ссылка для записи"
              name="contactLink"
              value={data.contactLink}
              placeholder="https://..."
            />
          )}
          <AdminButton>Сохранить</AdminButton>
        </form>
      </AdminCard>
    </AdminShell>
  );
}
