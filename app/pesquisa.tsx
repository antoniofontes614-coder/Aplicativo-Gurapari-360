import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { beaches } from '@/src/data/beaches';
import { colors, radius } from '@/src/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => beaches.filter((beach) => `${beach.name} ${beach.category} ${beach.neighborhood}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0, 12), [query]);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  return <SafeAreaView style={styles.safe}><View style={styles.content}><View style={styles.input}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} hitSlop={10}><Ionicons name="arrow-back" size={22} color="#102A43"/></Pressable><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Busque praias e experiências" placeholderTextColor="#667085" style={styles.textInput}/></View><Text style={styles.hint}>Sugestões de praias, categorias, serviços, eventos, hotéis e restaurantes</Text><FlatList data={results} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => router.push(`/praias/${item.id}`)} style={styles.row}><Ionicons name="location-outline" color={colors.ocean} size={21}/><View><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.neighborhood} · Praia · {item.category}</Text></View></Pressable>}/></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.surface }, content: { padding: 20, flex: 1 }, input: { backgroundColor: '#FFFFFF', borderRadius: radius.pill, paddingHorizontal: 16, alignItems: 'center', flexDirection: 'row', gap: 12 }, textInput: { height: 54, flex: 1, fontSize: 16, color: '#102A43' }, hint: { color: colors.muted, lineHeight: 20, marginVertical: 18 }, row: { paddingVertical: 17, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', gap: 13 }, name: { fontWeight: '800', color: colors.ink }, meta: { color: colors.muted, marginTop: 3 } });
