import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/auth';
import { colors, radius } from '@/src/theme';

type AdminUser = { id: string; email: string | null; created_at: string; role: 'admin' | 'member'; subscription_status: string | null; current_period_end: string | null };
async function getDashboard() { if (!supabase) throw new Error('Supabase não configurado.'); const { data, error } = await supabase.functions.invoke<{ users: AdminUser[] }>('admin-dashboard'); if (error) throw error; return data?.users ?? []; }
export default function AdminDashboard() { const role = useAuth((state) => state.role); const { data = [], isLoading, error } = useQuery({ queryKey: ['admin-dashboard'], queryFn: getDashboard, enabled: true }); return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Administração</Text><Text style={styles.text}>Usuários e assinaturas</Text>{isLoading ? <ActivityIndicator color={colors.ocean} /> : error ? <Text style={styles.error}>Não foi possível carregar os dados.</Text> : data.map((user) => <View key={user.id} style={styles.card}><Text style={styles.email}>{user.email ?? 'E-mail indisponível'}</Text><Text style={styles.meta}>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</Text><Text style={styles.meta}>Assinatura: {user.subscription_status ?? 'Sem assinatura'}</Text>{user.current_period_end && <Text style={styles.meta}>Válida até {new Date(user.current_period_end).toLocaleDateString('pt-BR')}</Text>}</View>)}</ScrollView></SafeAreaView>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.surface }, content: { padding: 24, gap: 12 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900' }, text: { color: colors.muted, marginBottom: 10 }, card: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.md, borderWidth: 1, padding: 16, gap: 5 }, email: { color: colors.ink, fontWeight: '800' }, meta: { color: colors.muted }, error: { color: '#B42318' } });
