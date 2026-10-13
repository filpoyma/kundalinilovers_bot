import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./admin-session";
import type {
  IAdminScheduleOverview,
  ITimezoneOption,
  TContentPageKey,
  TScheduleType,
} from "./admin-types";

const API_BASE =
  process.env.ADMIN_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:5000/api/kundalinilovers-bot";

type TApiSuccess<T> = { success: true; data: T };
type TApiError = { success: false; error: { code: string; message: string } };

export class AdminApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ADMIN_SESSION_COOKIE)?.value;
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = await readApiJson<T>(response);
  if (!body.success) {
    throw new AdminApiError(
      body.error?.message ?? "Ошибка API",
      body.error?.code ?? "API_ERROR",
      response.status,
    );
  }

  return body.data;
}

async function readApiJson<T>(
  response: Response,
): Promise<TApiSuccess<T> | TApiError> {
  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();

  if (!contentType.includes("application/json")) {
    throw new AdminApiError(
      `Ответ не JSON (${response.status}). Проверьте ADMIN_API_URL — должен указывать на Express (порт сервера бота), не на Next.js.`,
      "INVALID_RESPONSE",
      response.status,
    );
  }

  try {
    return JSON.parse(raw) as TApiSuccess<T> | TApiError;
  } catch {
    throw new AdminApiError(
      "Некорректный JSON от API",
      "INVALID_RESPONSE",
      response.status,
    );
  }
}

export async function exchangeTelegramAuth(
  payload: Record<string, unknown>,
): Promise<string> {
  const response = await fetch(`${API_BASE}/admin/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await readApiJson<{ token: string }>(response);

  if (!body.success) {
    throw new AdminApiError(
      body.error?.message ?? "Ошибка входа",
      body.error?.code ?? "AUTH_ERROR",
      response.status,
    );
  }

  return body.data.token;
}

export async function fetchMe(): Promise<{ telegramId: number }> {
  return adminFetch("/admin/me");
}

export async function fetchSchedule(type: TScheduleType): Promise<IAdminScheduleOverview> {
  return adminFetch(`/admin/schedule/${type}`);
}

export async function updateScheduleTitle(type: TScheduleType, title: string): Promise<void> {
  await adminFetch(`/admin/schedule/${type}/title`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function createOfflineSection(data: {
  country: string;
  city: string;
  address: string;
}): Promise<void> {
  await adminFetch("/admin/schedule/offline/sections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOfflineSection(
  id: string,
  data: { country: string; city: string; address: string },
): Promise<void> {
  await adminFetch(`/admin/schedule/offline/sections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSection(type: TScheduleType, id: string): Promise<void> {
  await adminFetch(`/admin/schedule/${type}/sections/${id}`, { method: "DELETE" });
}

export async function createOnlineSection(data: {
  platform: string;
  link: string;
}): Promise<void> {
  await adminFetch("/admin/schedule/online/sections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOnlineSection(
  id: string,
  data: { platform: string; link: string },
): Promise<void> {
  await adminFetch(`/admin/schedule/online/sections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createSlot(
  type: TScheduleType,
  sectionId: string,
  slot: { dayOfWeek: number; startTime: string; endTime: string; title: string },
): Promise<void> {
  await adminFetch(`/admin/schedule/${type}/sections/${sectionId}/slots`, {
    method: "POST",
    body: JSON.stringify(slot),
  });
}

export async function updateSlot(
  type: TScheduleType,
  sectionId: string,
  slotId: string,
  slot: { dayOfWeek: number; startTime: string; endTime: string; title: string },
): Promise<void> {
  await adminFetch(`/admin/schedule/${type}/sections/${sectionId}/slots/${slotId}`, {
    method: "PUT",
    body: JSON.stringify(slot),
  });
}

export async function deleteSlot(
  type: TScheduleType,
  sectionId: string,
  slotId: string,
): Promise<void> {
  await adminFetch(`/admin/schedule/${type}/sections/${sectionId}/slots/${slotId}`, {
    method: "DELETE",
  });
}

export async function fetchContent(key: TContentPageKey): Promise<{
  content: string;
  contactLink: string;
}> {
  return adminFetch(`/admin/content/${key}`);
}

export async function updateContent(
  key: TContentPageKey,
  data: { content: string; contactLink?: string },
): Promise<void> {
  await adminFetch(`/admin/content/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchTimezone(): Promise<{
  timezone: string;
  label: string;
  options: ITimezoneOption[];
}> {
  return adminFetch("/admin/timezone");
}

export async function updateTimezone(timezone: string): Promise<void> {
  await adminFetch("/admin/timezone", {
    method: "PUT",
    body: JSON.stringify({ timezone }),
  });
}
