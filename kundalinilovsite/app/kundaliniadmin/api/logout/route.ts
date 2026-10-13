import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/kundaliniadmin/login", origin));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/kundaliniadmin",
    maxAge: 0,
  });
  return response;
}
