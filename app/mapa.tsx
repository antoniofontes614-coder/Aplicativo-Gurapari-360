import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPreview } from '@/src/components/MapPreview';
import { beaches } from '@/src/data/beaches';
import { colors, radius } from '@/src/theme';

export default function MapScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const beach = beaches.find((item) => item.id === id) ?? beaches[0];
  const navigate = () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${beach.latitude},${beach.longitude}`);
  return <SafeAreaView style={styles.safe}><MapPreview beach={beach}/><Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={22}/></Pressable><View style={styles.sheet}><Text style={styles.title}>{beach.name}</Text><Text style={styles.text}>{beach.neighborhood}, Guarapari · ES</Text><Pressable style={styles.button} onPress={navigate}><Ionicons name="navigate" size={19} color="white"/><Text style={styles.buttonText}>Como chegar</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, back: { position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }, sheet: { position: 'absolute', left: 16, right: 16, bottom: 22, backgroundColor: 'white', padding: 20, borderRadius: radius.lg }, title: { fontSize: 21, fontWeight: '900', color: colors.ink }, text: { color: colors.muted, marginTop: 5 }, button: { marginTop: 16, backgroundColor: colors.ocean, padding: 14, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, buttonText: { color: 'white', fontWeight: '900' } });
