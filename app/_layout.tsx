import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Redirect, router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/src/store/auth';
import { getMySubscription, hasPremium } from '@/src/lib/subscription';
import { colors } from '@/src/theme';

function BackButton() {
  const pathname = usePathname();
  const hasOwnBackButton = pathname === '/explorar' || pathname === '/pesquisa' || pathname === '/mapa' || pathname.startsWith('/praias/');
  if (pathname === '/' || hasOwnBackButton) return null;
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  return <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink}/></Pressable>;
}

function SubscriptionAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useAuth((state) => state.session);
  const role = useAuth((state) => state.role);
  const isPublicRoute = pathname.startsWith('/auth/');
  const canManageAccount = pathname === '/assinatura' || pathname === '/perfil';
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: getMySubscription,
    enabled: Boolean(session) && !isPublicRoute && role !== 'admin',
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  if (session && !isPublicRoute && role !== 'admin' && !canManageAccount) {
    if (isLoading) return null;
    if (!hasPremium(subscription ?? null)) return <Redirect href="/assinatura" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuth((state) => state.initialize);
  const initialized = useAuth((state) => state.initialized);
  const session = useAuth((state) => state.session);
  const pathname = usePathname();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 10, retry: 1 } } }));
  useEffect(() => { void initialize(); }, [initialize]);
  const isPublicRoute = pathname.startsWith('/auth/');
  if (!initialized) return null;
  if (!session && !isPublicRoute) return <Redirect href="/auth/login" />;
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><SubscriptionAccessGuard><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.surface } }} /><BackButton/></SubscriptionAccessGuard></QueryClientProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({ back: { position: 'absolute', zIndex: 50, top: 58, left: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, shadowColor: '#000', shadowOpacity: .22, shadowRadius: 8, elevation: 5 } });
