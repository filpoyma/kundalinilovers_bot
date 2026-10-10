import { escapeTelegramHtml } from './telegramHtml';
import { buildGoogleMapsDirectionsUrl, buildOfflineLocationMapsQuery } from './googleMaps';

export function formatOfflineLocationHeaderHtml(location: {
  country: string;
  city: string;
  address: string;
}): string {
  const country = escapeTelegramHtml(location.country);
  const city = escapeTelegramHtml(location.city);
  const address = escapeTelegramHtml(location.address);
  const mapsUrl = buildGoogleMapsDirectionsUrl(buildOfflineLocationMapsQuery(location)).replace(
    /&/g,
    '&amp;',
  );

  return `${country} · ${city} · <a href="${mapsUrl}">${address}</a>`;
}
