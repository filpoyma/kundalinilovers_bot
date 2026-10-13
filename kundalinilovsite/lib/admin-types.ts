export type TScheduleType = "online" | "offline";

export type TContentPageKey = "services" | "private_session";

export interface IAdminSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
}

export interface IAdminOfflineSection {
  id: string;
  country: string;
  city: string;
  address: string;
  slots: IAdminSlot[];
}

export interface IAdminOnlineSection {
  id: string;
  platform: string;
  link: string;
  slots: IAdminSlot[];
}

export interface IAdminScheduleOverview {
  type: TScheduleType;
  title: string | null;
  sections: IAdminOfflineSection[] | IAdminOnlineSection[];
}

export interface ITimezoneOption {
  id: string;
  label: string;
}
