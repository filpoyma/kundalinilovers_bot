import { redirect } from "next/navigation";
import { TelegramLoginButton } from "@/components/admin/telegram-login-button";
import { AdminApiError, fetchMe } from "@/lib/admin-api";

export const instant = false;

export default async function AdminLoginPage() {
  try {
    await fetchMe();
    redirect("/kundaliniadmin");
  } catch (error) {
    if (error instanceof AdminApiError && error.status !== 401) {
      // not logged in — show login
    }
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4 text-[#f8f8f8]">
        <p>Не задан NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-4 text-[14px] uppercase tracking-[-1px] text-[#f8f8f8]">
      <p className="text-[#929292]">вход в админ-панель</p>
      <h1 className="mt-4">Telegram</h1>
      <p className="mt-4 max-w-sm text-center text-[#929292] normal-case">
        Доступ только для администраторов из TELEGRAM_ADMINS
      </p>
      <TelegramLoginButton botUsername={botUsername} />
    </div>
  );
}
