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

const seedDataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-data.json');

async function loadSeedData(): Promise<TSeedData> {
  const raw = await fs.readFile(seedDataPath, 'utf8');
  return JSON.parse(raw) as TSeedData;
}

async function seed(): Promise<void> {
  await connectDatabase();

  const data = await loadSeedData();

  for (const page of data.contentPages) {
    await ContentPage.findOneAndUpdate(
      { key: page.key },
      {
        content: page.content,
        ...(page.contactLink ? { contactLink: page.contactLink } : {}),
      },
      { upsert: true },
    );
  }

  for (const page of data.schedulePages) {
    await SchedulePage.findOneAndUpdate(
      { type: page.type },
      { title: page.title },
      { upsert: true },
    );
  }

  await OfflineLocation.deleteMany({});
  await OnlinePlatform.deleteMany({});

  if (data.offlineLocations.length > 0) {
    await OfflineLocation.insertMany(data.offlineLocations);
  }

  if (data.onlinePlatforms.length > 0) {
    await OnlinePlatform.insertMany(data.onlinePlatforms);
  }

  logger.info('Seed completed successfully');
  logger.info(
    `contentPages: ${data.contentPages.length}, schedulePages: ${data.schedulePages.length}, offlineLocations: ${data.offlineLocations.length}, onlinePlatforms: ${data.onlinePlatforms.length}`,
  );

  await mongoose.connection.close();
}

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
