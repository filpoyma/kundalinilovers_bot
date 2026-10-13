import { saveTimezoneAction } from "@/app/kundaliniadmin/(protected)/actions";
import { AdminButton, AdminCard, AdminShell } from "@/components/admin/admin-ui";
import { fetchTimezone } from "@/lib/admin-api";

export default async function AdminTimezonePage() {
  const data = await fetchTimezone();

  return (
    <AdminShell title="Таймзона расписания">
      <AdminCard>
        <p className="mb-4 text-[#929292] normal-case">
          Текущая: {data.label} ({data.timezone})
        </p>
        <form action={saveTimezoneAction}>
          <label className="block mb-4">
            <span className="text-[#929292]">Выберите таймзону</span>
            <select
              name="timezone"
              defaultValue={data.timezone}
              className="mt-2 w-full max-w-[500px] rounded-[5px] border border-[#929292]/60 bg-[#111] px-3 py-2 normal-case text-[#f8f8f8] outline-none focus:border-[#00ff95]"
            >
              {data.options.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <AdminButton>Сохранить таймзону</AdminButton>
        </form>
      </AdminCard>
    </AdminShell>
  );
}
