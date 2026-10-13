import { NextResponse } from "next/server";
import { exchangeTelegramAuth, AdminApiError } from "@/lib/admin-api";
import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await exchangeTelegramAuth(body);
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
    return response;
  } catch (error) {
    const message =
      error instanceof AdminApiError ? error.message : "Не удалось войти";
    const status = error instanceof AdminApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
