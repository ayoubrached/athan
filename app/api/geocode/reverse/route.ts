export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const incomingUrl = new URL(request.url);
  const upstream = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
  upstream.search = incomingUrl.searchParams.toString();

  // Ensure we request a single, English result by default
  const params = new URLSearchParams(upstream.search);
  if (!params.has('count')) params.set('count', '1');
  if (!params.has('language')) params.set('language', 'en');
  if (!params.has('format')) params.set('format', 'json');
  upstream.search = params.toString();

  const res = await fetch(upstream.toString(), { cache: 'no-store' });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Upstream error', status: res.status }), {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

