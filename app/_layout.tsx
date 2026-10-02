import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/src/store/auth';
import { colors } from '@/src/theme';

function BackButton() {
  const pathname = usePathname();
  const hasOwnBackButton = pathname === '/explorar' || pathname === '/pesquisa' || pathname === '/mapa' || pathname.startsWith('/praias/');
  if (pathname === '/' || hasOwnBackButton) return null;
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  return <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink}/></Pressable>;
}

function SubscriptionAccessGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuth((state) => state.initialize);
  const initialized = useAuth((state) => state.initialized);
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 10, retry: 1 } } }));
  useEffect(() => { void initialize(); }, [initialize]);
  if (!initialized) return null;
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><SubscriptionAccessGuard><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.surface } }} /><BackButton/></SubscriptionAccessGuard></QueryClientProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({ back: { position: 'absolute', zIndex: 50, top: 58, left: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, shadowColor: '#000', shadowOpacity: .22, shadowRadius: 8, elevation: 5 } });
