import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-ui";
import { ScheduleAdminPage } from "@/components/admin/schedule-admin";
import { fetchSchedule } from "@/lib/admin-api";
import { toScheduleDraft } from "@/lib/admin-schedule";
import type { TScheduleType } from "@/lib/admin-types";

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = await params;
  if (rawType !== "online" && rawType !== "offline") {
    notFound();
  }
  const type = rawType as TScheduleType;
  const data = await fetchSchedule(type);

  return (
    <AdminShell title={type === "offline" ? "Офлайн-расписание" : "Онлайн-расписание"}>
      <ScheduleAdminPage type={type} initial={toScheduleDraft(data)} />
    </AdminShell>
  );
}
