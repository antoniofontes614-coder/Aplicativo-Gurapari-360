import { supabase } from '@/src/lib/supabase';
import type { NearbyPlace } from '@/src/types';

export async function getNearbyPlaces(latitude: number, longitude: number, category: string): Promise<NearbyPlace[]> { if (!supabase) return []; const { data, error } = await supabase.functions.invoke<NearbyPlace[]>('nearby-places', { body: { latitude, longitude, category } }); if (error) throw error; return data ?? []; }

export type BeachPhoto = { url: string | null; attribution?: { name: string; uri?: string } | null };
const photoCache = new Map<string, BeachPhoto>();
export async function getBeachPhoto(name: string, latitude: number, longitude: number): Promise<BeachPhoto> { const cached = photoCache.get(name); if (cached) return cached; if (!supabase) return { url: null }; const { data, error } = await supabase.functions.invoke<BeachPhoto>('beach-photo', { body: { name, latitude, longitude } }); if (error || !data) return { url: null }; photoCache.set(name, data); return data; }
