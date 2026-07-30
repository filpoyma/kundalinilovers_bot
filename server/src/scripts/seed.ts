import '../config/env';
import mongoose from 'mongoose';
import connectDatabase from '../config/database';
import ContentPage from '../models/content-page.model';
import SchedulePage from '../models/schedule-page.model';
import OfflineLocation from '../models/offline-location.model';
import OnlinePlatform from '../models/online-platform.model';
import logger from '../config/logger';

async function seed(): Promise<void> {
  await connectDatabase();

  await ContentPage.findOneAndUpdate(
    { key: 'services' },
    {
      content:
        'Я провожу практики кундалини йоги, тантры жизни и личные сессии.\n\nВыберите интересующий раздел в меню.',
    },
    { upsert: true },
  );

  await ContentPage.findOneAndUpdate(
    { key: 'private_session' },
    {
      content:
        'Личная сессия — это индивидуальная работа с вашим запросом в безопасном пространстве.',
      contactLink: 'https://t.me/your_contact',
    },
    { upsert: true },
  );

  await SchedulePage.findOneAndUpdate(
    { type: 'offline' },
    { title: 'Регулярные классы' },
    { upsert: true },
  );

  await SchedulePage.findOneAndUpdate(
    { type: 'online' },
    { title: 'Онлайн-классы' },
    { upsert: true },
  );

  await OfflineLocation.deleteMany({});
  await OnlinePlatform.deleteMany({});

  await OfflineLocation.create({
    country: 'Бали',
    city: 'Чангу',
    address: 'Born To Be Complex',
    sortOrder: 0,
    slots: [
      { dayOfWeek: 2, startTime: '20:00', endTime: '21:00', title: 'тантра жизни', sortOrder: 0 },
      { dayOfWeek: 4, startTime: '20:00', endTime: '21:00', title: 'кундалини йога', sortOrder: 1 },
    ],
  });

  await OfflineLocation.create({
    country: 'Бали',
    city: 'Убуд',
    address: 'Arco Studio',
    sortOrder: 1,
    slots: [
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:00', title: 'тантра жизни', sortOrder: 0 },
      { dayOfWeek: 5, startTime: '19:00', endTime: '20:00', title: 'кундалини йога', sortOrder: 1 },
    ],
  });

  await OnlinePlatform.create({
    platform: 'Zoom',
    link: 'https://zoom.us/j/example',
    sortOrder: 0,
    slots: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', title: 'кундалини йога', sortOrder: 0 },
      { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', title: 'тантра жизни', sortOrder: 1 },
    ],
  });

  logger.info('Seed completed successfully');
  await mongoose.connection.close();
}

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
