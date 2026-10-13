"use server";

import { revalidatePath } from "next/cache";
import {
  createOfflineSection,
  createOnlineSection,
  createSlot,
  deleteSection,
  deleteSlot,
  updateContent,
  updateOfflineSection,
  updateOnlineSection,
  updateScheduleTitle,
  updateSlot,
  updateTimezone,
} from "@/lib/admin-api";
import type { TContentPageKey, TScheduleType } from "@/lib/admin-types";

function parseDay(value: FormDataEntryValue | null): number | null {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0 || num > 6) return null;
  return num;
}

export async function saveScheduleTitleAction(type: TScheduleType, formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Введите заголовок");
  await updateScheduleTitle(type, title);
  revalidatePath(`/kundaliniadmin/schedule/${type}`);
}

export async function createOfflineSectionAction(formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!country || !city || !address) throw new Error("Заполните все поля");
  await createOfflineSection({ country, city, address });
  revalidatePath("/kundaliniadmin/schedule/offline");
}

export async function createOnlineSectionAction(formData: FormData): Promise<void> {
  const platform = String(formData.get("platform") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  if (!platform || !link) throw new Error("Заполните все поля");
  await createOnlineSection({ platform, link });
  revalidatePath("/kundaliniadmin/schedule/online");
}

export async function updateOfflineSectionAction(sectionId: string, formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  if (!country || !city || !address) throw new Error("Заполните все поля");
  await updateOfflineSection(sectionId, { country, city, address });
  revalidatePath("/kundaliniadmin/schedule/offline");
}

export async function updateOnlineSectionAction(sectionId: string, formData: FormData): Promise<void> {
  const platform = String(formData.get("platform") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  if (!platform || !link) throw new Error("Заполните все поля");
  await updateOnlineSection(sectionId, { platform, link });
  revalidatePath("/kundaliniadmin/schedule/online");
}

export async function deleteSectionAction(type: TScheduleType, sectionId: string): Promise<void> {
  await deleteSection(type, sectionId);
  revalidatePath(`/kundaliniadmin/schedule/${type}`);
}

export async function createSlotAction(
  type: TScheduleType,
  sectionId: string,
  formData: FormData,
): Promise<void> {
  const dayOfWeek = parseDay(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (dayOfWeek === null || !startTime || !endTime || !title) {
    throw new Error("Заполните поля слота");
  }
  await createSlot(type, sectionId, { dayOfWeek, startTime, endTime, title });
  revalidatePath(`/kundaliniadmin/schedule/${type}`);
}

export async function updateSlotAction(
  type: TScheduleType,
  sectionId: string,
  slotId: string,
  formData: FormData,
): Promise<void> {
  const dayOfWeek = parseDay(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (dayOfWeek === null || !startTime || !endTime || !title) {
    throw new Error("Заполните поля слота");
  }
  await updateSlot(type, sectionId, slotId, { dayOfWeek, startTime, endTime, title });
  revalidatePath(`/kundaliniadmin/schedule/${type}`);
}

export async function deleteSlotAction(
  type: TScheduleType,
  sectionId: string,
  slotId: string,
): Promise<void> {
  await deleteSlot(type, sectionId, slotId);
  revalidatePath(`/kundaliniadmin/schedule/${type}`);
}

export async function saveContentAction(key: TContentPageKey, formData: FormData): Promise<void> {
  const content = String(formData.get("content") ?? "").trim();
  const contactLink = String(formData.get("contactLink") ?? "").trim();
  if (!content) throw new Error("Введите текст");
  await updateContent(key, {
    content,
    contactLink: contactLink || undefined,
  });
  revalidatePath(`/kundaliniadmin/content/${key}`);
}

export async function saveTimezoneAction(formData: FormData): Promise<void> {
  const timezone = String(formData.get("timezone") ?? "").trim();
  if (!timezone) throw new Error("Выберите таймзону");
  await updateTimezone(timezone);
  revalidatePath("/kundaliniadmin/timezone");
}
