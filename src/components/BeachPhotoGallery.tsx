import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { colors, radius } from '@/src/theme';

type Photo = { id: string; storage_path: string; caption: string | null };

export function BeachPhotoGallery({ beachSlug }: { beachSlug: string }) {
  const { data = [] } = useQuery({
    queryKey: ['beach-photos', beachSlug],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) return [] as Photo[];
      const { data, error } = await supabase.from('beach_photos').select('id, storage_path, caption').eq('beach_slug', beachSlug).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
  });

  const client = supabase;
  if (!data.length || !client) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Fotos da praia</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {data.map((photo) => {
          const { data: url } = client.storage.from('beach-gallery').getPublicUrl(photo.storage_path);
          return <View key={photo.id} style={styles.card}><Image source={url.publicUrl} style={styles.image} contentFit="cover" /><Text numberOfLines={2} style={styles.caption}>{photo.caption || 'Foto enviada pela administração'}</Text></View>;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: 11 },
  list: { gap: 12 },
  card: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, overflow: 'hidden', width: 230 },
  image: { height: 150, width: '100%' },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 17, minHeight: 45, padding: 10 },
});
