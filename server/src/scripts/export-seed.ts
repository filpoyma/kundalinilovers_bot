import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../config/env';
import mongoose from 'mongoose';
import connectDatabase from '../config/database';
import ContentPage from '../models/content-page.model';
import SchedulePage from '../models/schedule-page.model';
import OfflineLocation from '../models/offline-location.model';
import OnlinePlatform from '../models/online-platform.model';
import logger from '../config/logger';
import type { TSeedData } from './seed.types';
import { stripSlots } from './seed.utils';

const seedDataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-data.json');

async function exportSeedData(): Promise<TSeedData> {
  const [contentPages, schedulePages, offlineLocations, onlinePlatforms] = await Promise.all([
    ContentPage.find().lean(),
    SchedulePage.find().lean(),
    OfflineLocation.find().sort({ sortOrder: 1 }).lean(),
    OnlinePlatform.find().sort({ sortOrder: 1 }).lean(),
  ]);

  return {
    contentPages: contentPages.map((page) => ({
      key: page.key,
      content: page.content,
      ...(page.contactLink ? { contactLink: page.contactLink } : {}),
    })),
    schedulePages: schedulePages.map((page) => ({
      type: page.type,
      title: page.title,
    })),
    offlineLocations: offlineLocations.map((location) => ({
      country: location.country,
      city: location.city,
      address: location.address,
      sortOrder: location.sortOrder,
      isActive: location.isActive,
      slots: stripSlots(location.slots),
    })),
    onlinePlatforms: onlinePlatforms.map((platform) => ({
      platform: platform.platform,
      link: platform.link,
      sortOrder: platform.sortOrder,
      isActive: platform.isActive,
      slots: stripSlots(platform.slots),
    })),
  };
}

async function main(): Promise<void> {
  await connectDatabase();

  const data = await exportSeedData();

  await fs.writeFile(seedDataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  logger.info(`Seed data exported to ${seedDataPath}`);
  logger.info(
    `contentPages: ${data.contentPages.length}, schedulePages: ${data.schedulePages.length}, offlineLocations: ${data.offlineLocations.length}, onlinePlatforms: ${data.onlinePlatforms.length}`,
  );

  await mongoose.connection.close();
}

main().catch((err) => {
  logger.error('Export seed failed:', err);
  process.exit(1);
});
