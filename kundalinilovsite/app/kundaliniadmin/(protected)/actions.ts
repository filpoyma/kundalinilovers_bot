"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminApiError, fetchSchedule, updateContent, updateTimezone } from "@/lib/admin-api";
import { parseScheduleDraft, toScheduleDraft } from "@/lib/admin-schedule";
import { ScheduleConflictError, saveSchedule } from "@/lib/admin-schedule-save";
import type {
  IScheduleDraft,
  TContentPageKey,
  TSaveScheduleResult,
  TScheduleType,
} from "@/lib/admin-types";

export type TSaveContentState = { ok: true } | { ok: false; message: string };

function saveErrorMessage(error: unknown): string {
  if (error instanceof ScheduleConflictError) {
    return "Расписание изменилось в другом месте. Показаны актуальные данные — внесите правки ещё раз.";
  }
  const reason = error instanceof AdminApiError ? error.message : "Ошибка сервера";
  return `Сохранено не всё: ${reason}. Показаны актуальные данные — проверьте и повторите.`;
}

async function loadScheduleDraft(type: TScheduleType): Promise<IScheduleDraft | undefined> {
  try {
    return toScheduleDraft(await fetchSchedule(type));
  } catch {
    return undefined;
  }
}

export async function saveScheduleAction(
  type: TScheduleType,
  input: unknown,
): Promise<TSaveScheduleResult> {
  if (type !== "online" && type !== "offline") {
    return { ok: false, message: "Некорректный тип расписания" };
  }

  const parsed = parseScheduleDraft(type, input);
  if (!parsed.ok) return parsed;

  try {
    await saveSchedule(type, parsed.draft);
  } catch (error) {
    revalidatePath(`/kundaliniadmin/schedule/${type}`);
    return { ok: false, message: saveErrorMessage(error), schedule: await loadScheduleDraft(type) };
  }

  revalidatePath(`/kundaliniadmin/schedule/${type}`);
  return { ok: true, schedule: await loadScheduleDraft(type) };
}

export async function saveContentAction(
  key: TContentPageKey,
  _prev: TSaveContentState,
  formData: FormData,
): Promise<TSaveContentState> {
  const content = String(formData.get("content") ?? "").trim();
  const contactLink = String(formData.get("contactLink") ?? "").trim();
  if (!content) {
    return { ok: false, message: "Введите текст" };
  }

  try {
    await updateContent(key, {
      content,
      contactLink: contactLink || undefined,
    });
  } catch (error) {
    const reason = error instanceof AdminApiError ? error.message : "Ошибка сервера";
    return { ok: false, message: reason };
  }

  revalidatePath(`/kundaliniadmin/content/${key}`);
  return { ok: true };
}

export async function saveTimezoneAction(formData: FormData): Promise<void> {
  const timezone = String(formData.get("timezone") ?? "").trim();
  if (!timezone) throw new Error("Выберите таймзону");
  await updateTimezone(timezone);
  revalidatePath("/kundaliniadmin/timezone");
  redirect("/kundaliniadmin/timezone");
}
