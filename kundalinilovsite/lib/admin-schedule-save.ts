import "server-only";
import {
  createOfflineSection,
  createOnlineSection,
  createSlot,
  deleteSection,
  deleteSlot,
  fetchSchedule,
  updateOfflineSection,
  updateOnlineSection,
  updateScheduleTitle,
  updateSlot,
} from "./admin-api";
import { SECTION_FIELDS, toScheduleDraft } from "./admin-schedule";
import type {
  IScheduleDraft,
  IScheduleSectionDraft,
  IScheduleSlotDraft,
  TScheduleType,
} from "./admin-types";

export class ScheduleConflictError extends Error {}

function slotPayload(slot: IScheduleSlotDraft) {
  return {
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    title: slot.title,
  };
}

function isSameSlot(a: IScheduleSlotDraft, b: IScheduleSlotDraft): boolean {
  return (
    a.dayOfWeek === b.dayOfWeek &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.title === b.title
  );
}

function isSameFields(type: TScheduleType, a: IScheduleSectionDraft, b: IScheduleSectionDraft): boolean {
  return SECTION_FIELDS[type].every(({ key }) => a.fields[key] === b.fields[key]);
}

async function createSection(type: TScheduleType, fields: Record<string, string>): Promise<string> {
  if (type === "offline") {
    return createOfflineSection({ country: fields.country, city: fields.city, address: fields.address });
  }
  return createOnlineSection({ platform: fields.platform, link: fields.link });
}

async function updateSection(
  type: TScheduleType,
  id: string,
  fields: Record<string, string>,
): Promise<void> {
  if (type === "offline") {
    await updateOfflineSection(id, { country: fields.country, city: fields.city, address: fields.address });
    return;
  }
  await updateOnlineSection(id, { platform: fields.platform, link: fields.link });
}

function assertKnownIds(current: IScheduleDraft, draft: IScheduleDraft): void {
  const currentById = new Map(current.sections.map(section => [section.id, section]));

  for (const section of draft.sections) {
    if (!section.id) {
      if (section.slots.some(slot => slot.id)) throw new ScheduleConflictError();
      continue;
    }
    const before = currentById.get(section.id);
    if (!before) throw new ScheduleConflictError();
    const slotIds = new Set(before.slots.map(slot => slot.id));
    if (section.slots.some(slot => slot.id && !slotIds.has(slot.id))) {
      throw new ScheduleConflictError();
    }
  }
}

async function syncSlots(
  type: TScheduleType,
  sectionId: string,
  before: IScheduleSlotDraft[],
  after: IScheduleSlotDraft[],
): Promise<void> {
  const keptIds = new Set(after.map(slot => slot.id).filter(Boolean));
  for (const slot of before) {
    if (slot.id && !keptIds.has(slot.id)) {
      await deleteSlot(type, sectionId, slot.id);
    }
  }

  const beforeById = new Map(before.map(slot => [slot.id, slot]));
  for (const slot of after) {
    if (!slot.id) {
      await createSlot(type, sectionId, slotPayload(slot));
      continue;
    }
    const previous = beforeById.get(slot.id);
    if (previous && !isSameSlot(previous, slot)) {
      await updateSlot(type, sectionId, slot.id, slotPayload(slot));
    }
  }
}

export async function saveSchedule(type: TScheduleType, draft: IScheduleDraft): Promise<void> {
  const current = toScheduleDraft(await fetchSchedule(type));
  assertKnownIds(current, draft);

  if (draft.title !== current.title) {
    await updateScheduleTitle(type, draft.title);
  }

  const keptSectionIds = new Set(draft.sections.map(section => section.id).filter(Boolean));
  for (const section of current.sections) {
    if (section.id && !keptSectionIds.has(section.id)) {
      await deleteSection(type, section.id);
    }
  }

  const currentById = new Map(current.sections.map(section => [section.id, section]));
  for (const section of draft.sections) {
    if (!section.id) {
      const sectionId = await createSection(type, section.fields);
      await syncSlots(type, sectionId, [], section.slots);
      continue;
    }

    const before = currentById.get(section.id);
    if (!before) continue;
    if (!isSameFields(type, before, section)) {
      await updateSection(type, section.id, section.fields);
    }
    await syncSlots(type, section.id, before.slots, section.slots);
  }
}
