export const DEFAULT_SCHEDULE_TIMEZONE = 'Asia/Makassar';

export type TTimezoneOption = {
  id: string;
  label: string;
};

export const TIMEZONE_OPTIONS: TTimezoneOption[] = [
  { id: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { id: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { id: 'Europe/Samara', label: 'Самара (UTC+4)' },
  { id: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { id: 'Asia/Omsk', label: 'Омск (UTC+6)' },
  { id: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { id: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { id: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
  { id: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { id: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
  { id: 'Asia/Kamchatka', label: 'Камчатка (UTC+12)' },
  { id: 'Asia/Makassar', label: 'Бали (UTC+8)' },
  { id: 'Asia/Bangkok', label: 'Бангкок (UTC+7)' },
  { id: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
  { id: 'Asia/Tbilisi', label: 'Тбилиси (UTC+4)' },
  { id: 'Asia/Almaty', label: 'Алматы (UTC+5)' },
  { id: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
  { id: 'Europe/Minsk', label: 'Минск (UTC+3)' },
  { id: 'Europe/London', label: 'Лондон (UTC+0)' },
  { id: 'Europe/Dublin', label: 'Дублин (UTC+0)' },
  { id: 'Europe/Paris', label: 'Париж (UTC+1)' },
  { id: 'Europe/Berlin', label: 'Берлин (UTC+1)' },
  { id: 'Europe/Amsterdam', label: 'Амстердам (UTC+1)' },
  { id: 'Europe/Rome', label: 'Рим (UTC+1)' },
  { id: 'Europe/Stockholm', label: 'Стокгольм (UTC+1)' },
  { id: 'Europe/Oslo', label: 'Осло (UTC+1)' },
  { id: 'Europe/Helsinki', label: 'Хельсинки (UTC+2)' },
  { id: 'Europe/Athens', label: 'Афины (UTC+2)' },
  { id: 'Europe/Bucharest', label: 'Бухарест (UTC+2)' },
  { id: 'Europe/Istanbul', label: 'Стамбул (UTC+3)' },
  { id: 'UTC', label: 'UTC' },
];

export const TIMEZONES_PER_PAGE = 6;
