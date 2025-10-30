export type GeoLocation = {
  latitude: number;
  longitude: number;
  timezone?: string;
  displayName?: string;
  country?: string;
  admin1?: string;
};

type OpenMeteoSearch = {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    timezone?: string;
  }>;
};

type OpenMeteoReverse = {
  results?: Array<{
    name?: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
    timezone?: string;
  }>;
};

export async function searchCity(query: string): Promise<GeoLocation | null> {
  const url = `/api/geocode/search?name=${encodeURIComponent(
    query.trim()
  )}&count=1&language=en&format=json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json()) as OpenMeteoSearch;
  const r = data.results?.[0];
  if (!r) return null;
  return {
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    displayName: composeDisplayName(r.name, r.admin1, r.country),
    country: r.country,
    admin1: r.admin1,
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeoLocation | null> {
  async function query(lat: number, lon: number) {
    const url = `/api/geocode/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenMeteoReverse;
    return data.results?.[0] ?? null;
  }

  let r = await query(latitude, longitude);
  if (!r || (!r.name && !r.admin1 && !r.country)) {
    // Retry with rounded coordinates to improve hit-rate for reverse geocoding
    const latR = Number(latitude.toFixed(3));
    const lonR = Number(longitude.toFixed(3));
    r = await query(latR, lonR);
  }

  if (!r) {
    return {
      latitude,
      longitude,
      displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  }

  return {
    latitude,
    longitude,
    timezone: r.timezone,
    displayName:
      composeDisplayName(r.name ?? '', r.admin1, r.country) ||
      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    country: r.country,
    admin1: r.admin1,
  };
}

export function composeDisplayName(
  name?: string,
  admin1?: string,
  country?: string
): string {
  return [name, admin1, country].filter(Boolean).join(', ');
}

