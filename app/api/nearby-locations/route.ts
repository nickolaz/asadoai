import { z } from 'zod';
import type { MapLocation, MapLocationKind } from '@/data/map-locations';

export const runtime = 'edge';

const inputSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

const searches: Array<{ query: string; kind: MapLocationKind }> = [
  { query: 'RES Carnicería Buenos Aires', kind: 'butcher' },
  { query: 'Coto Buenos Aires', kind: 'price-source' },
  { query: 'Disco Buenos Aires', kind: 'price-source' },
];

export async function POST(request: Request) {
  let input;
  try {
    input = inputSchema.parse(await request.json());
  } catch {
    return Response.json({ locations: [] }, { status: 400 });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return Response.json({ locations: [] });

  const responses = await Promise.allSettled(searches.map(async ({ query, kind }) => {
    const params = new URLSearchParams({
      q: query,
      proximity: `${input.longitude},${input.latitude}`,
      country: 'AR',
      limit: '8',
      access_token: token,
    });
    const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`);
    if (!response.ok) return [] as MapLocation[];
    const payload = await response.json() as {
      features?: Array<{
        id?: string;
        properties?: { name?: string; full_address?: string; place_formatted?: string };
        geometry?: { coordinates?: number[] };
      }>;
    };
    return (payload.features ?? []).flatMap((feature, index) => {
      const coordinates = feature.geometry?.coordinates;
      if (!coordinates || coordinates.length < 2) return [];
      const [longitude, latitude] = coordinates;
      if (typeof longitude !== 'number' || typeof latitude !== 'number') return [];
      return [{
        id: `mapbox-${kind}-${feature.id ?? `${query}-${index}`}`,
        name: feature.properties?.name ?? query,
        address: feature.properties?.full_address ?? feature.properties?.place_formatted ?? 'Buenos Aires',
        coordinates: [longitude, latitude] as [number, number],
        kind,
        distanceKm: distanceKm(input.longitude, input.latitude, longitude, latitude),
      }];
    });
  }));

  const locations = responses.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  return Response.json({ locations });
}

function distanceKm(fromLng: number, fromLat: number, toLng: number, toLat: number) {
  const radians = (value: number) => value * Math.PI / 180;
  const a = Math.sin(radians(toLat - fromLat) / 2) ** 2 + Math.cos(radians(fromLat)) * Math.cos(radians(toLat)) * Math.sin(radians(toLng - fromLng) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
