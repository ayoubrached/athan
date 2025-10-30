export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const incomingUrl = new URL(request.url);
  const lat = incomingUrl.searchParams.get('latitude');
  const lon = incomingUrl.searchParams.get('longitude');
  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: 'latitude and longitude are required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  // Narrow types for downstream usage
  const latStr: string = lat;
  const lonStr: string = lon;

  async function fetchOpenMeteo(): Promise<Response | null> {
    const upstream = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
    upstream.search = incomingUrl.searchParams.toString();
    const params = new URLSearchParams(upstream.search);
    if (!params.has('count')) params.set('count', '1');
    if (!params.has('language')) params.set('language', 'en');
    if (!params.has('format')) params.set('format', 'json');
    upstream.search = params.toString();
    try {
      const res = await fetch(upstream.toString(), { cache: 'no-store' });
      return res.ok ? res : null;
    } catch {
      return null;
    }
  }

  async function fetchNominatim(latParam: string, lonParam: string): Promise<any | null> {
    const upstream = new URL('https://nominatim.openstreetmap.org/reverse');
    upstream.searchParams.set('format', 'jsonv2');
    upstream.searchParams.set('lat', latParam);
    upstream.searchParams.set('lon', lonParam);
    upstream.searchParams.set('zoom', '10');
    try {
      const res = await fetch(upstream.toString(), {
        cache: 'no-store',
        headers: {
          'User-Agent': 'athan-app/0.1 (+github.com/ayoubrached/athan)',
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const addr = data?.address ?? {};
      const name = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || '';
      const admin1 = addr.state || addr.region || undefined;
      const country = addr.country || undefined;
      const result = {
        results: [
          {
            name,
            latitude: Number(latParam),
            longitude: Number(lonParam),
            admin1,
            country,
            timezone: undefined,
          },
        ],
      };
      return result;
    } catch {
      return null;
    }
  }

  // Try Open-Meteo first
  const om = await fetchOpenMeteo();
  if (om) {
    const data = await om.json();
    const results = data?.results;
    if (Array.isArray(results) && results.length > 0) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  // Fallback: Nominatim
  const nom = await fetchNominatim(latStr, lonStr);
  if (nom) {
    return new Response(JSON.stringify(nom), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Reverse geocoding failed' }), {
    status: 502,
    headers: { 'content-type': 'application/json' },
  });
}

