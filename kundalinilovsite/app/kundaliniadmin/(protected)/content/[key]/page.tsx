import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-ui";
import { AdminContentForm } from "@/components/admin/admin-content-form";
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
      <AdminContentForm
        contentKey={key}
        initialContent={data.content}
        initialContactLink={data.contactLink}
      />
    </AdminShell>
  );
}
