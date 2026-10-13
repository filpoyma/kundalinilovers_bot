"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { AdminCard, indexLabel } from "@/components/admin/admin-ui";
import { saveScheduleAction } from "@/app/kundaliniadmin/(protected)/actions";
import { DAY_OPTIONS, SECTION_FIELDS, parseScheduleDraft } from "@/lib/admin-schedule";
import type {
  IScheduleDraft,
  IScheduleSectionDraft,
  IScheduleSlotDraft,
  TScheduleType,
} from "@/lib/admin-types";

interface ISlotRow extends IScheduleSlotDraft {
  key: string;
}

interface ISectionCard extends Omit<IScheduleSectionDraft, "slots"> {
  key: string;
  slots: ISlotRow[];
}

interface IEditorState {
  title: string;
  sections: ISectionCard[];
}

const INPUT_CLASS =
  "w-full rounded-[5px] border border-[#929292]/60 bg-[#111] px-3 py-2 normal-case text-[#f8f8f8] outline-none [color-scheme:dark] focus:border-[#00ff95]";

const SLOT_GRID = "grid grid-cols-2 gap-2 sm:grid-cols-[80px_110px_110px_1fr_40px] sm:items-center";

function toEditorState(draft: IScheduleDraft): IEditorState {
  return {
    title: draft.title,
    sections: draft.sections.map(section => ({
      ...section,
      key: section.id ?? "",
      slots: section.slots.map(slot => ({ ...slot, key: slot.id ?? "" })),
    })),
  };
}

function toDraft(state: IEditorState): IScheduleDraft {
  return {
    title: state.title,
    sections: state.sections.map(({ id, fields, slots }) => ({
      id,
      fields,
      slots: slots.map(({ id: slotId, dayOfWeek, startTime, endTime, title }) => ({
        id: slotId,
        dayOfWeek,
        startTime,
        endTime,
        title,
      })),
    })),
  };
}

function snapshot(state: IEditorState): string {
  return JSON.stringify(toDraft(state));
}

export function ScheduleAdminPage({
  type,
  initial,
}: {
  type: TScheduleType;
  initial: IScheduleDraft;
}) {
  const [state, setState] = useState(() => toEditorState(initial));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(toEditorState(initial)));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const nextKey = useRef(0);

  const isDirty = snapshot(state) !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const newKey = () => `new-${nextKey.current++}`;

  const resetTo = (draft: IScheduleDraft) => {
    const next = toEditorState(draft);
    setState(next);
    setSavedSnapshot(snapshot(next));
  };

  const patchSection = (key: string, patch: (section: ISectionCard) => ISectionCard) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(section => (section.key === key ? patch(section) : section)),
    }));
  };

  const addSection = () => {
    const fields = Object.fromEntries(SECTION_FIELDS[type].map(({ key }) => [key, ""]));
    setState(prev => ({
      ...prev,
      sections: [...prev.sections, { key: newKey(), fields, slots: [] }],
    }));
  };

  const removeSection = (section: ISectionCard) => {
    if (section.id) {
      const warning =
        type === "offline"
          ? "Удалить секцию? Подписки на напоминания по ней отключатся после сохранения."
          : "Удалить секцию после сохранения?";
      if (!window.confirm(warning)) return;
    }
    setState(prev => ({
      ...prev,
      sections: prev.sections.filter(item => item.key !== section.key),
    }));
  };

  const addSlot = (sectionKey: string) => {
    patchSection(sectionKey, section => {
      const last = section.slots.at(-1);
      const slot: ISlotRow = {
        key: newKey(),
        dayOfWeek: last?.dayOfWeek ?? 1,
        startTime: last?.startTime ?? "",
        endTime: last?.endTime ?? "",
        title: last?.title ?? "",
      };
      return { ...section, slots: [...section.slots, slot] };
    });
  };

  const handleSave = () => {
    const draft = toDraft(state);
    const check = parseScheduleDraft(type, draft);
    if (!check.ok) {
      setError(check.message);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await saveScheduleAction(type, draft);
      if (result.schedule) {
        resetTo(result.schedule);
      } else if (result.ok) {
        window.location.reload();
        return;
      }
      if (!result.ok) setError(result.message);
    });
  };

  const status = error ?? (isDirty ? "Есть несохранённые изменения" : "Все изменения сохранены");

  return (
    <div className="pb-32">
      <AdminCard>
        <FieldLabel label="Заголовок страницы">
          <input
            className={INPUT_CLASS}
            value={state.title}
            onChange={event => setState(prev => ({ ...prev, title: event.target.value }))}
          />
        </FieldLabel>
      </AdminCard>

      {state.sections.map((section, index) => (
        <SectionEditor
          key={section.key}
          type={type}
          index={index}
          section={section}
          onChange={patch => patchSection(section.key, patch)}
          onRemove={() => removeSection(section)}
          onAddSlot={() => addSlot(section.key)}
        />
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex h-[53px] w-full items-center justify-center rounded-[5px] border border-dashed border-[#929292]/60 text-[#929292] hover:border-[#00ff95] hover:text-[#00ff95]"
      >
        + секция
      </button>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#929292]/40 bg-[#080808] px-[15px] py-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="flex h-[53px] w-full max-w-[350px] items-center justify-center rounded-[5px] bg-[#f8f8f8] text-[#080808] hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Сохранение…" : "Сохранить"}
          </button>
          <p className={`normal-case ${error ? "text-[#ff6b6b]" : "text-[#929292]"}`}>{status}</p>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  type,
  index,
  section,
  onChange,
  onRemove,
  onAddSlot,
}: {
  type: TScheduleType;
  index: number;
  section: ISectionCard;
  onChange: (patch: (section: ISectionCard) => ISectionCard) => void;
  onRemove: () => void;
  onAddSlot: () => void;
}) {
  const setField = (key: string, value: string) => {
    onChange(prev => ({ ...prev, fields: { ...prev.fields, [key]: value } }));
  };

  const setSlot = (slotKey: string, patch: Partial<IScheduleSlotDraft>) => {
    onChange(prev => ({
      ...prev,
      slots: prev.slots.map(slot => (slot.key === slotKey ? { ...slot, ...patch } : slot)),
    }));
  };

  const removeSlot = (slotKey: string) => {
    onChange(prev => ({ ...prev, slots: prev.slots.filter(slot => slot.key !== slotKey) }));
  };

  return (
    <AdminCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[#00ff95]">
          Секция {indexLabel(index)}
          {!section.id && <span className="ml-2 text-[10px] text-[#929292]">новая</span>}
        </h2>
        <RemoveButton label="Удалить секцию" onClick={onRemove} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTION_FIELDS[type].map(({ key, label }) => (
          <FieldLabel key={key} label={label}>
            <input
              className={INPUT_CLASS}
              value={section.fields[key] ?? ""}
              onChange={event => setField(key, event.target.value)}
            />
          </FieldLabel>
        ))}
      </div>

      <div className="mt-6 border-t border-[#929292]/30 pt-4">
        <h3 className="mb-3 text-[#929292]">Слоты</h3>
        {section.slots.length > 0 && (
          <div className={`${SLOT_GRID} mb-2 hidden text-[10px] text-[#929292] sm:grid`}>
            <span>День</span>
            <span>Начало</span>
            <span>Конец</span>
            <span>Название</span>
            <span />
          </div>
        )}
        {section.slots.map(slot => (
          <div key={slot.key} className={`${SLOT_GRID} mb-3 border-b border-[#929292]/20 pb-3 sm:mb-2 sm:border-0 sm:pb-0`}>
            <select
              aria-label="День"
              className={INPUT_CLASS}
              value={slot.dayOfWeek}
              onChange={event => setSlot(slot.key, { dayOfWeek: Number(event.target.value) })}
            >
              {DAY_OPTIONS.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            <input
              aria-label="Начало"
              type="time"
              className={INPUT_CLASS}
              value={slot.startTime}
              onChange={event => setSlot(slot.key, { startTime: event.target.value })}
            />
            <input
              aria-label="Конец"
              type="time"
              className={INPUT_CLASS}
              value={slot.endTime}
              onChange={event => setSlot(slot.key, { endTime: event.target.value })}
            />
            <input
              aria-label="Название"
              placeholder="Название"
              className={`${INPUT_CLASS} col-span-2 sm:col-span-1`}
              value={slot.title}
              onChange={event => setSlot(slot.key, { title: event.target.value })}
            />
            <RemoveButton label="Удалить слот" onClick={() => removeSlot(slot.key)} />
          </div>
        ))}
        <button
          type="button"
          onClick={onAddSlot}
          className="mt-2 text-[#929292] hover:text-[#00ff95]"
        >
          + слот
        </button>
      </div>
    </AdminCard>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[#929292]">{label}</span>
      {children}
    </label>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-[38px] w-[38px] items-center justify-center rounded-[5px] text-[#929292] hover:text-[#ff6b6b]"
    >
      ✕
    </button>
  );
}
