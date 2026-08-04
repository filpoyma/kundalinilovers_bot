import SchedulePage from '../models/schedule-page.model';
import OfflineLocation from '../models/offline-location.model';
import OnlinePlatform from '../models/online-platform.model';
import type { TScheduleType, IScheduleSlot } from '../types/schedule.types';
import {
  compareSlotsByStartTime,
  formatSlotLine,
} from '../types/schedule.types';
import type { Types } from 'mongoose';

export async function getSchedulePageTitle(type: TScheduleType): Promise<string | null> {
  const page = await SchedulePage.findOne({ type });
  return page?.title ?? null;
}

export async function upsertSchedulePageTitle(type: TScheduleType, title: string) {
  return SchedulePage.findOneAndUpdate({ type }, { title }, { upsert: true, new: true });
}

export async function upsertSchedulePageTimezone(type: TScheduleType, timezone: string) {
  return SchedulePage.findOneAndUpdate({ type }, { timezone }, { upsert: true, new: true });
}

export async function getActiveOfflineLocations() {
  return OfflineLocation.find({ isActive: true }).sort({ sortOrder: 1 });
}

export async function getAllOfflineLocations() {
  return OfflineLocation.find().sort({ sortOrder: 1 });
}

export async function getActiveOnlinePlatforms() {
  return OnlinePlatform.find({ isActive: true }).sort({ sortOrder: 1 });
}

export async function getAllOnlinePlatforms() {
  return OnlinePlatform.find().sort({ sortOrder: 1 });
}

export async function createOfflineLocation(data: {
  country: string;
  city: string;
  address: string;
  slots?: IScheduleSlot[];
  sortOrder?: number;
}) {
  return OfflineLocation.create(data);
}

export async function createOnlinePlatform(data: {
  platform: string;
  link: string;
  slots?: IScheduleSlot[];
  sortOrder?: number;
}) {
  return OnlinePlatform.create(data);
}

export async function addSlotToOfflineLocation(locationId: Types.ObjectId, slot: IScheduleSlot) {
  return OfflineLocation.findByIdAndUpdate(
    locationId,
    { $push: { slots: slot } },
    { new: true },
  );
}

export async function addSlotToOnlinePlatform(platformId: Types.ObjectId, slot: IScheduleSlot) {
  return OnlinePlatform.findByIdAndUpdate(
    platformId,
    { $push: { slots: slot } },
    { new: true },
  );
}

export async function getOfflineLocationById(id: Types.ObjectId) {
  return OfflineLocation.findById(id);
}

export async function getOnlinePlatformById(id: Types.ObjectId) {
  return OnlinePlatform.findById(id);
}

export async function findOfflineLocationBySlotId(slotId: Types.ObjectId) {
  return OfflineLocation.findOne({ 'slots._id': slotId });
}

export async function findOnlinePlatformBySlotId(slotId: Types.ObjectId) {
  return OnlinePlatform.findOne({ 'slots._id': slotId });
}

export async function updateOfflineLocation(
  id: Types.ObjectId,
  data: { country: string; city: string; address: string },
) {
  return OfflineLocation.findByIdAndUpdate(id, data, { new: true });
}

export async function updateOnlinePlatform(
  id: Types.ObjectId,
  data: { platform: string; link: string },
) {
  return OnlinePlatform.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteOfflineLocation(id: Types.ObjectId) {
  return OfflineLocation.findByIdAndDelete(id);
}

export async function deleteOnlinePlatform(id: Types.ObjectId) {
  return OnlinePlatform.findByIdAndDelete(id);
}

export function getSortedSlots(slots: IScheduleSlot[]): IScheduleSlot[] {
  return [...slots].sort(compareSlotsByStartTime);
}

export { formatSlotLine };

export async function deleteOfflineSlot(locationId: Types.ObjectId, slotId: Types.ObjectId) {
  return OfflineLocation.findByIdAndUpdate(
    locationId,
    { $pull: { slots: { _id: slotId } } },
    { new: true },
  );
}

export async function deleteOnlineSlot(platformId: Types.ObjectId, slotId: Types.ObjectId) {
  return OnlinePlatform.findByIdAndUpdate(
    platformId,
    { $pull: { slots: { _id: slotId } } },
    { new: true },
  );
}

export async function updateOfflineSlot(
  locationId: Types.ObjectId,
  slotId: Types.ObjectId,
  slot: Omit<IScheduleSlot, '_id'>,
) {
  return OfflineLocation.findOneAndUpdate(
    { _id: locationId, 'slots._id': slotId },
    {
      $set: {
        'slots.$.dayOfWeek': slot.dayOfWeek,
        'slots.$.startTime': slot.startTime,
        'slots.$.endTime': slot.endTime,
        'slots.$.title': slot.title,
        'slots.$.sortOrder': slot.sortOrder,
      },
    },
    { new: true },
  );
}

export async function updateOnlineSlot(
  platformId: Types.ObjectId,
  slotId: Types.ObjectId,
  slot: Omit<IScheduleSlot, '_id'>,
) {
  return OnlinePlatform.findOneAndUpdate(
    { _id: platformId, 'slots._id': slotId },
    {
      $set: {
        'slots.$.dayOfWeek': slot.dayOfWeek,
        'slots.$.startTime': slot.startTime,
        'slots.$.endTime': slot.endTime,
        'slots.$.title': slot.title,
        'slots.$.sortOrder': slot.sortOrder,
      },
    },
    { new: true },
  );
}

export function findSlotById(
  slots: IScheduleSlot[],
  slotId: string,
): IScheduleSlot | undefined {
  return slots.find((slot) => slot._id?.toString() === slotId);
}

export function formatOfflineLocationHeader(location: {
  country: string;
  city: string;
  address: string;
}): string {
  return `${location.country} · ${location.city} · ${location.address}`;
}

export function formatOnlinePlatformHeader(platform: { platform: string; link: string }): string {
  return `${platform.platform}\n${platform.link}`;
}
