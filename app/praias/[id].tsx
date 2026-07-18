import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeachCover } from '@/src/components/BeachCover';
import { BeachWeather } from '@/src/components/BeachWeather';
import { MapPreview } from '@/src/components/MapPreview';
import { NearbyServices } from '@/src/components/NearbyServices';
import { beaches } from '@/src/data/beaches';
import { useFavorites } from '@/src/store/favorites';
import { colors, radius } from '@/src/theme';

export default function BeachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const beach = beaches.find((item) => item.id === id);
  const saved = useFavorites((state) => state.ids.includes(id));
  const toggle = useFavorites((state) => state.toggle);

  if (!beach) return <SafeAreaView><Text>Praia não encontrada.</Text></SafeAreaView>;

  const navigate = () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${beach.latitude},${beach.longitude}`);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/explorar');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <BeachCover beachSlug={beach.id} name={beach.name} height={300} />
          <View style={styles.top}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.circle}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable>
            <Pressable onPress={() => toggle(beach.id)} style={styles.circle}><Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? colors.coral : colors.ink} /></Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{beach.category.toUpperCase()} · {beach.neighborhood.toUpperCase()}</Text>
          <Text style={styles.title}>{beach.name}</Text>
          <Text style={styles.rating}>★ {beach.rating.toFixed(1)} · {beach.reviews} avaliações</Text>
          <Text style={styles.description}>{beach.description}</Text>

          <BeachWeather latitude={beach.latitude} longitude={beach.longitude} />
          <Text style={styles.mapLabel}>Visão satélite</Text>
          <View style={styles.mapPreview}><MapPreview beach={beach} /></View>
          <Pressable onPress={navigate} style={styles.navigate}><Ionicons name="navigate" color={colors.onPrimary} size={20} /><Text style={styles.navigateText}>Como chegar</Text></Pressable>

          <Info title="Boa para" items={beach.suitableFor} />
          <View style={styles.grid}>
            <Fact label="Melhor horário" value={beach.bestTime} />
            <Fact label="Melhor época" value={beach.bestSeason} />
            <Fact label="Areia" value={beach.sand} />
            <Fact label="Ondas" value={beach.waves} />
          </View>
          <NearbyServices beachName={beach.name} latitude={beach.latitude} longitude={beach.longitude} />
          <Text style={styles.heading}>História</Text>
          <Text style={styles.description} numberOfLines={4}>{beach.history}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return <><Text style={styles.heading}>{title}</Text><View style={styles.pills}>{items.map((item) => <View key={item} style={styles.pill}><Text style={styles.pillText}>{item}</Text></View>)}</View></>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <View style={styles.fact}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  top: { position: 'absolute', left: 18, right: 18, top: 16, flexDirection: 'row', justifyContent: 'space-between' },
  circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 36 },
  category: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: colors.aqua, marginTop: 4 },
  title: { fontSize: 30, fontWeight: '900', color: colors.ink, marginTop: 8 },
  rating: { marginTop: 7, fontWeight: '700', color: colors.ink },
  description: { color: colors.muted, lineHeight: 23, marginTop: 14 },
  mapLabel: { marginTop: 22, marginBottom: 9, fontWeight: '900', color: colors.ink, fontSize: 17 },
  mapPreview: { height: 210, overflow: 'hidden', borderRadius: radius.md, backgroundColor: colors.surface },
  navigate: { backgroundColor: colors.ocean, marginTop: 16, borderRadius: radius.pill, padding: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  navigateText: { color: colors.onPrimary, fontWeight: '900' },
  heading: { fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 28, marginBottom: 11 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: colors.sand, borderColor: colors.line, borderWidth: 1, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 13 },
  pillText: { color: colors.ink, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 26 },
  fact: { width: '48%', backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.sm, padding: 13 },
  factLabel: { fontSize: 12, color: colors.muted },
  factValue: { fontWeight: '800', color: colors.ink, marginTop: 4 },
});
