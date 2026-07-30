export function buildGoogleMapsDirectionsUrl(query: string): string {
  const destination = encodeURIComponent(query);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function buildOfflineLocationMapsQuery(location: {
  country: string;
  city: string;
  address: string;
}): string {
  return `${location.country}, ${location.city}, ${location.address}`;
}
