const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
type RequestBody = { name?: string; latitude?: number; longitude?: number };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  const { name, latitude, longitude } = await request.json() as RequestBody;
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return Response.json({ error: 'Parâmetros inválidos.' }, { status: 400, headers: corsHeaders });
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) return Response.json({ error: 'Serviço não configurado.' }, { status: 503, headers: corsHeaders });
  const lookup = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.photos' }, body: JSON.stringify({ textQuery: `${name}, Guarapari, Espírito Santo`, locationBias: { circle: { center: { latitude, longitude }, radius: 1200 } }, maxResultCount: 1 }) });
  if (!lookup.ok) return Response.json({ error: 'Falha ao localizar a praia.' }, { status: 502, headers: corsHeaders });
  const data = await lookup.json() as { places?: { photos?: { name: string; authorAttributions?: { displayName: string; uri?: string }[] }[] }[] };
  const photo = data.places?.[0]?.photos?.[0];
  if (!photo) return Response.json({ url: null }, { headers: corsHeaders });
  const media = await fetch(`https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&skipHttpRedirect=true`, { headers: { 'X-Goog-Api-Key': apiKey } });
  if (!media.ok) return Response.json({ url: null }, { headers: corsHeaders });
  const payload = await media.json() as { photoUri?: string };
  const attribution = photo.authorAttributions?.[0];
  return Response.json({ url: payload.photoUri ?? null, attribution: attribution ? { name: attribution.displayName, uri: attribution.uri } : null }, { headers: corsHeaders });
});
