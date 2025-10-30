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

  async function fetchNominatim(): Promise<any | null> {
    const upstream = new URL('https://nominatim.openstreetmap.org/reverse');
    upstream.searchParams.set('format', 'jsonv2');
    upstream.searchParams.set('lat', lat);
    upstream.searchParams.set('lon', lon);
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
            latitude: Number(lat),
            longitude: Number(lon),
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
  const nom = await fetchNominatim();
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

