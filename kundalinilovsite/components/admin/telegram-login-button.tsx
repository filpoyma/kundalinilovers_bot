"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type TTelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TTelegramUser) => void;
  }
}

export function TelegramLoginButton({ botUsername }: { botUsername: string }) {
  const router = useRouter();

  useEffect(() => {
    window.onTelegramAuth = async (user: TTelegramUser) => {
      const response = await fetch("/kundaliniadmin/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message ?? "Не удалось войти";
        alert(message);
        return;
      }

      router.push("/kundaliniadmin");
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, router]);

  return <div id="telegram-login-container" className="mt-8" />;
}
