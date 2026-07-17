type NearbySearch = { latitude: number; longitude: number; category: string };
const categoryTypes: Record<string, string> = { hotéis: 'lodging', pousadas: 'lodging', restaurantes: 'restaurant', bares: 'bar', farmácias: 'pharmacy', hospitais: 'hospital', supermercados: 'supermarket', postos: 'gas_station', estacionamentos: 'parking', padarias: 'bakery', sorveterias: 'ice_cream', táxis: 'taxi' };

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { latitude, longitude, category } = await request.json() as NearbySearch;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !category) return Response.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) return Response.json({ error: 'Serviço não configurado.' }, { status: 503 });
  const type = categoryTypes[category.toLocaleLowerCase('pt-BR')] ?? 'tourist_attraction';
  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos' }, body: JSON.stringify({ includedTypes: [type], maxResultCount: 20, locationRestriction: { circle: { center: { latitude, longitude }, radius: 5000 } } }) });
  if (!response.ok) return Response.json({ error: 'Falha no Google Places.' }, { status: 502 });
  const data = await response.json() as { places?: { id:string; displayName?:{text:string}; formattedAddress?:string; rating?:number; nationalPhoneNumber?:string; websiteUri?:string }[] };
  return Response.json((data.places ?? []).map((place) => ({ id:place.id, name:place.displayName?.text ?? 'Local', type:category, rating:place.rating, address:place.formattedAddress ?? '', phone:place.nationalPhoneNumber, website:place.websiteUri })));
});
