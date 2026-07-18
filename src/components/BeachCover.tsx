import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BeachVisual } from './BeachVisual';
import { supabase } from '@/src/lib/supabase';

type Props = { beachSlug: string; name: string; uri?: string; height?: number };
type UploadedPhoto = { id: string; url: string };

export function BeachCover({ beachSlug, name, uri, height }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: uploadedPhotos = [] } = useQuery({
    queryKey: ['beach-cover-gallery', beachSlug],
    enabled: Boolean(supabase),
    queryFn: async () => {
      const client = supabase;
      if (!client) return [] as UploadedPhoto[];
      const { data, error } = await client.from('beach_photos').select('id, storage_path').eq('beach_slug', beachSlug).order('display_order').order('created_at');
      if (error) throw error;
      return (data ?? []).map((photo) => ({ id: photo.id, url: client.storage.from('beach-gallery').getPublicUrl(photo.storage_path).data.publicUrl }));
    },
  });

  const width = Dimensions.get('window').width;
  if (!uploadedPhotos.length) return <BeachVisual name={name} uri={uri} height={height} />;

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, uploadedPhotos.length - 1));
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setCurrentIndex(next);
  };

  return <View>
    <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(event) => setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {uploadedPhotos.map((photo) => <View key={photo.id} style={{ width }}><BeachVisual name={name} uri={photo.url} preferUri height={height} /></View>)}
    </ScrollView>
    {uploadedPhotos.length > 1 && <>
      <Pressable accessibilityRole="button" accessibilityLabel="Foto anterior" onPress={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} style={[styles.arrow, styles.left, currentIndex === 0 && styles.hidden]}><Ionicons name="chevron-back" size={26} color="white" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Próxima foto" onPress={() => goTo(currentIndex + 1)} disabled={currentIndex === uploadedPhotos.length - 1} style={[styles.arrow, styles.right, currentIndex === uploadedPhotos.length - 1 && styles.hidden]}><Ionicons name="chevron-forward" size={26} color="white" /></Pressable>
      <View pointerEvents="none" style={styles.counter}><Text style={styles.counterText}>{currentIndex + 1} de {uploadedPhotos.length}</Text></View>
    </>}
  </View>;
}

const styles = StyleSheet.create({
  arrow: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 22, height: 44, justifyContent: 'center', marginTop: -22, position: 'absolute', top: '50%', width: 44 },
  left: { left: 14 },
  right: { right: 14 },
  hidden: { opacity: 0.25 },
  counter: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.58)', borderRadius: 14, bottom: 12, paddingHorizontal: 11, paddingVertical: 5, position: 'absolute' },
  counterText: { color: 'white', fontSize: 12, fontWeight: '900' },
});
