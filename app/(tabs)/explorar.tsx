import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeachCard } from '@/src/components/BeachCard';
import { beaches } from '@/src/data/beaches';
import { colors, radius } from '@/src/theme';
import type { BeachCategory } from '@/src/types';

export default function ExploreScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selected] = useState(category);
  const data = useMemo(() => selected && selected !== 'Todas' ? beaches.filter((beach) => beach.category === selected as BeachCategory) : beaches, [selected]);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');

  return <SafeAreaView style={styles.safe}><FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <BeachCard beach={item} compact/>} ListHeaderComponent={<View><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.ink}/><Text style={styles.backText}>Voltar</Text></Pressable><Text style={styles.title}>Explorar praias</Text><Text style={styles.subtitle}>{data.length} lugares para viver Guarapari</Text></View>}/></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.surface }, content: { padding: 20 }, back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 20 }, backText: { color: colors.ink, fontWeight: '800' }, title: { fontSize: 28, fontWeight: '900', color: colors.ink }, subtitle: { color: colors.muted, marginTop: 5, marginBottom: 22 } });
