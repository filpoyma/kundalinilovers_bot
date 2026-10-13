import { indexLabel } from "@/components/admin/admin-ui";
import type {
  IAdminScheduleOverview,
  IAdminSlot,
  IScheduleDraft,
  IScheduleSectionDraft,
  IScheduleSlotDraft,
  TScheduleType,
} from "./admin-types";

const MAX_SHORT = 500;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const SECTION_FIELDS: Record<TScheduleType, readonly { key: string; label: string }[]> = {
  offline: [
    { key: "country", label: "Страна" },
    { key: "city", label: "Город" },
    { key: "address", label: "Адрес" },
  ],
  online: [
    { key: "platform", label: "Платформа" },
    { key: "link", label: "Ссылка" },
  ],
};

export const DAY_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
];

type TParseResult = { ok: true; draft: IScheduleDraft } | { ok: false; message: string };

function mondayFirst(dayOfWeek: number): number {
  return (dayOfWeek + 6) % 7;
}

function compareSlots(a: IScheduleSlotDraft, b: IScheduleSlotDraft): number {
  return (
    mondayFirst(a.dayOfWeek) - mondayFirst(b.dayOfWeek) || a.startTime.localeCompare(b.startTime)
  );
}

function toSlotDraft(slot: IAdminSlot): IScheduleSlotDraft {
  return {
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    title: slot.title,
  };
}

export function toScheduleDraft(overview: IAdminScheduleOverview): IScheduleDraft {
  const sections = overview.sections.map((section): IScheduleSectionDraft => {
    const fields: Record<string, string> =
      "country" in section
        ? { country: section.country, city: section.city, address: section.address }
        : { platform: section.platform, link: section.link };
    return {
      id: section.id,
      fields,
      slots: section.slots.map(toSlotDraft).sort(compareSlots),
    };
  });
  return { title: overview.title ?? "", sections };
}

function readText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_SHORT) return null;
  return trimmed;
}

function readId(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function parseSlot(input: unknown, place: string): IScheduleSlotDraft | string {
  const data = asRecord(input);
  if (!data) return `${place}: некорректные данные`;

  const dayOfWeek = data.dayOfWeek;
  if (typeof dayOfWeek !== "number" || !Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return `${place}: выберите день`;
  }

  const startTime = readText(data.startTime);
  const endTime = readText(data.endTime);
  if (!startTime || !endTime || !TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
    return `${place}: укажите время начала и конца (ЧЧ:ММ)`;
  }

  const title = readText(data.title);
  if (!title) return `${place}: заполните название`;

  return { id: readId(data.id), dayOfWeek, startTime, endTime, title };
}

function parseSection(
  type: TScheduleType,
  input: unknown,
  place: string,
): IScheduleSectionDraft | string {
  const data = asRecord(input);
  const rawFields = asRecord(data?.fields);
  if (!data || !rawFields || !Array.isArray(data.slots)) return `${place}: некорректные данные`;

  const fields: Record<string, string> = {};
  for (const { key, label } of SECTION_FIELDS[type]) {
    const value = readText(rawFields[key]);
    if (!value) return `${place}: заполните «${label}»`;
    fields[key] = value;
  }

  const slots: IScheduleSlotDraft[] = [];
  for (const [index, rawSlot] of data.slots.entries()) {
    const slot = parseSlot(rawSlot, `${place}, слот ${indexLabel(index)}`);
    if (typeof slot === "string") return slot;
    slots.push(slot);
  }

  return { id: readId(data.id), fields, slots };
}

export function parseScheduleDraft(type: TScheduleType, input: unknown): TParseResult {
  const data = asRecord(input);
  if (!data || !Array.isArray(data.sections)) {
    return { ok: false, message: "Некорректные данные расписания" };
  }

  const title = readText(data.title);
  if (!title) return { ok: false, message: "Введите заголовок страницы" };

  const sections: IScheduleSectionDraft[] = [];
  for (const [index, rawSection] of data.sections.entries()) {
    const section = parseSection(type, rawSection, `Секция ${indexLabel(index)}`);
    if (typeof section === "string") return { ok: false, message: section };
    sections.push(section);
  }

  return { ok: true, draft: { title, sections } };
}
