import type { TContentPageKey, TScheduleType, IScheduleSlot } from '../types/schedule.types';

export type TSeedContentPage = {
  key: TContentPageKey;
  content: string;
  contactLink?: string;
};

export type TSeedSchedulePage = {
  type: TScheduleType;
  title: string;
  timezone?: string;
};

export type TSeedScheduleSlot = Omit<IScheduleSlot, '_id'>;

export type TSeedOfflineLocation = {
  country: string;
  city: string;
  address: string;
  sortOrder: number;
  isActive: boolean;
  slots: TSeedScheduleSlot[];
};

export type TSeedOnlinePlatform = {
  platform: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
  slots: TSeedScheduleSlot[];
};

export type TSeedData = {
  contentPages: TSeedContentPage[];
  schedulePages: TSeedSchedulePage[];
  offlineLocations: TSeedOfflineLocation[];
  onlinePlatforms: TSeedOnlinePlatform[];
};
