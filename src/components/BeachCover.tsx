import { useQuery } from '@tanstack/react-query';
import { Dimensions, ScrollView, View } from 'react-native';
import { BeachVisual } from './BeachVisual';
import { supabase } from '@/src/lib/supabase';

type Props = { beachSlug: string; name: string; uri?: string; height?: number };

export function BeachCover({ beachSlug, name, uri, height }: Props) {
  const { data: uploadedPhotos = [] } = useQuery({
    queryKey: ['beach-cover-gallery', beachSlug],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) return undefined;
      const { data, error } = await supabase.from('beach_photos').select('storage_path').eq('beach_slug', beachSlug).order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((photo) => supabase.storage.from('beach-gallery').getPublicUrl(photo.storage_path).data.publicUrl);
    },
  });

  const width = Dimensions.get('window').width;
  if (!uploadedPhotos.length) return <BeachVisual name={name} uri={uri} height={height} />;
  return <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>{uploadedPhotos.map((photo) => <View key={photo} style={{ width }}><BeachVisual name={name} uri={photo} preferUri height={height} /></View>)}</ScrollView>;
}
