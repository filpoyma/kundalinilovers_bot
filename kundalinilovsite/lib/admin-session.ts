export const ADMIN_SESSION_COOKIE = "ka_session";

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/kundaliniadmin",
  maxAge: 7 * 24 * 60 * 60,
};
