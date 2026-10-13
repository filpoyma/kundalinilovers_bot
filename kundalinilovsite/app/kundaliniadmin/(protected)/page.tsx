import { AdminMenuLink, AdminShell } from "@/components/admin/admin-ui";

const MENU = [
  { href: "/kundaliniadmin/schedule/offline", label: "Офлайн-расписание" },
  { href: "/kundaliniadmin/schedule/online", label: "Онлайн-расписание" },
  { href: "/kundaliniadmin/content/services", label: "Обо мне" },
  { href: "/kundaliniadmin/content/private_session", label: "Личная сессия" },
  { href: "/kundaliniadmin/timezone", label: "Таймзона расписания" },
];

export default function AdminHomePage() {
  return (
    <AdminShell title="Админ-панель">
      <nav>
        {MENU.map((item, index) => (
          <AdminMenuLink key={item.href} href={item.href} index={index} label={item.label} />
        ))}
      </nav>
    </AdminShell>
  );
}
