import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Beach } from '@/src/types';
import { getBeachPhoto } from '@/src/services/places';
import { colors, radius } from '@/src/theme';
import { BeachVisual } from './BeachVisual';

export function BeachCard({ beach, compact = false }: { beach: Beach; compact?: boolean }) { const [photo, setPhoto] = useState<string | undefined>(); useEffect(() => { let active = true; getBeachPhoto(beach.name, beach.latitude, beach.longitude).then((result) => { if (active && result.url) setPhoto(result.url); }); return () => { active = false; }; }, [beach.id, beach.latitude, beach.longitude, beach.name]); return <Pressable onPress={() => router.push(`/praias/${beach.id}`)} style={[styles.card, compact && styles.compact]}><BeachVisual name={beach.name} uri={photo} height={compact ? 134 : 175}/><View style={styles.body}><Text numberOfLines={1} style={styles.name}>{beach.name}</Text><Text style={styles.meta}>{beach.neighborhood} · {beach.category}</Text><View style={styles.rating}><Ionicons name="star" size={14} color="#E9A23B"/><Text style={styles.ratingText}>{beach.rating.toFixed(1)} ({beach.reviews})</Text></View></View></Pressable>; }
const styles = StyleSheet.create({ card: { width: 250, overflow: 'hidden', backgroundColor: colors.card, borderRadius: radius.md, marginRight: 14, shadowColor: '#000', shadowOpacity: .28, shadowRadius: 14, elevation: 3 }, compact: { width: '100%', marginRight: 0, marginBottom: 14 }, body: { padding: 13, gap: 4 }, name: { fontWeight: '800', fontSize: 16, color: colors.ink }, meta: { color: colors.muted, fontSize: 13 }, rating: { flexDirection: 'row', alignItems: 'center', gap: 4 }, ratingText: { color: colors.ink } });
