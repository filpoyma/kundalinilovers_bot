import {
  AdminButton,
  AdminCard,
  AdminField,
  indexLabel,
} from "@/components/admin/admin-ui";
import type { IAdminOfflineSection, IAdminOnlineSection, TScheduleType } from "@/lib/admin-types";
import {
  createOfflineSectionAction,
  createOnlineSectionAction,
  createSlotAction,
  deleteSectionAction,
  deleteSlotAction,
  saveScheduleTitleAction,
  updateOfflineSectionAction,
  updateOnlineSectionAction,
  updateSlotAction,
} from "@/app/kundaliniadmin/(protected)/actions";

const DAY_HINT = "0=вс, 1=пн … 6=сб";

export function ScheduleAdminPage({
  type,
  title,
  sections,
}: {
  type: TScheduleType;
  title: string | null;
  sections: IAdminOfflineSection[] | IAdminOnlineSection[];
}) {
  return (
    <div>
      <AdminCard>
        <h2 className="text-[#00ff95]">Заголовок страницы</h2>
        <form action={saveScheduleTitleAction.bind(null, type)}>
          <AdminField label="Текущий заголовок" name="title" value={title ?? ""} required />
          <AdminButton>Сохранить заголовок</AdminButton>
        </form>
      </AdminCard>

      <AdminCard>
        <h2 className="mb-4 text-[#00ff95]">Новая секция</h2>
        {type === "offline" ? (
          <form action={createOfflineSectionAction}>
            <AdminField label="Страна" name="country" required />
            <AdminField label="Город" name="city" required />
            <AdminField label="Адрес" name="address" required />
            <AdminButton>Создать секцию</AdminButton>
          </form>
        ) : (
          <form action={createOnlineSectionAction}>
            <AdminField label="Платформа" name="platform" required />
            <AdminField label="Ссылка" name="link" required />
            <AdminButton>Создать секцию</AdminButton>
          </form>
        )}
      </AdminCard>

      {sections.map((section, sectionIndex) => (
        <AdminCard key={section.id}>
          <p className="text-[10px] text-[#929292]">{indexLabel(sectionIndex)} секция</p>
          {type === "offline" ? (
            <OfflineSectionBlock section={section as IAdminOfflineSection} />
          ) : (
            <OnlineSectionBlock section={section as IAdminOnlineSection} />
          )}
        </AdminCard>
      ))}
    </div>
  );
}

function OfflineSectionBlock({ section }: { section: IAdminOfflineSection }) {
  return (
    <>
      <form action={updateOfflineSectionAction.bind(null, section.id)}>
        <AdminField label="Страна" name="country" value={section.country} required />
        <AdminField label="Город" name="city" value={section.city} required />
        <AdminField label="Адрес" name="address" value={section.address} required />
        <AdminButton>Сохранить секцию</AdminButton>
      </form>
      <form action={deleteSectionAction.bind(null, "offline", section.id)} className="mt-4">
        <AdminButton type="submit">Удалить секцию</AdminButton>
      </form>
      <SlotsBlock type="offline" sectionId={section.id} slots={section.slots} />
    </>
  );
}

function OnlineSectionBlock({ section }: { section: IAdminOnlineSection }) {
  return (
    <>
      <form action={updateOnlineSectionAction.bind(null, section.id)}>
        <AdminField label="Платформа" name="platform" value={section.platform} required />
        <AdminField label="Ссылка" name="link" value={section.link} required />
        <AdminButton>Сохранить секцию</AdminButton>
      </form>
      <form action={deleteSectionAction.bind(null, "online", section.id)} className="mt-4">
        <AdminButton type="submit">Удалить секцию</AdminButton>
      </form>
      <SlotsBlock type="online" sectionId={section.id} slots={section.slots} />
    </>
  );
}

function SlotsBlock({
  type,
  sectionId,
  slots,
}: {
  type: TScheduleType;
  sectionId: string;
  slots: { id: string; dayOfWeek: number; startTime: string; endTime: string; title: string }[];
}) {
  return (
    <div className="mt-8 border-t border-[#929292]/30 pt-6">
      <h3 className="mb-4 text-[#929292]">Слоты</h3>
      {slots.map((slot, index) => (
        <div key={slot.id} className="mb-6 rounded border border-[#929292]/20 p-4">
          <p className="mb-2 text-[10px] text-[#929292]">слот {indexLabel(index)}</p>
          <form action={updateSlotAction.bind(null, type, sectionId, slot.id)}>
            <AdminField
              label={`День (${DAY_HINT})`}
              name="dayOfWeek"
              type="number"
              value={String(slot.dayOfWeek)}
              required
            />
            <AdminField label="Начало" name="startTime" value={slot.startTime} required />
            <AdminField label="Конец" name="endTime" value={slot.endTime} required />
            <AdminField label="Название" name="title" value={slot.title} required />
            <AdminButton>Сохранить слот</AdminButton>
          </form>
          <form action={deleteSlotAction.bind(null, type, sectionId, slot.id)} className="mt-2">
            <AdminButton type="submit">Удалить слот</AdminButton>
          </form>
        </div>
      ))}
      <form action={createSlotAction.bind(null, type, sectionId)} className="mt-4">
        <p className="mb-2 text-[#00ff95]">Добавить слот</p>
        <AdminField label={`День (${DAY_HINT})`} name="dayOfWeek" type="number" required />
        <AdminField label="Начало" name="startTime" placeholder="19:00" required />
        <AdminField label="Конец" name="endTime" placeholder="20:00" required />
        <AdminField label="Название" name="title" required />
        <AdminButton>Добавить слот</AdminButton>
      </form>
    </div>
  );
}
