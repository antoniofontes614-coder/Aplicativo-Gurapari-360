import { useQuery } from '@tanstack/react-query';
import { BeachVisual } from './BeachVisual';
import { supabase } from '@/src/lib/supabase';

type Props = { beachSlug: string; name: string; uri?: string; height?: number };

export function BeachCover({ beachSlug, name, uri, height }: Props) {
  const { data: uploadedPhoto } = useQuery({
    queryKey: ['beach-cover', beachSlug],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) return undefined;
      const { data, error } = await supabase.from('beach_photos').select('storage_path').eq('beach_slug', beachSlug).order('created_at', { ascending: false }).limit(1);
      if (error) throw error;
      const storagePath = data?.[0]?.storage_path;
      return storagePath ? supabase.storage.from('beach-gallery').getPublicUrl(storagePath).data.publicUrl : undefined;
    },
  });

  return <BeachVisual name={name} uri={uploadedPhoto ?? uri} height={height} />;
}
