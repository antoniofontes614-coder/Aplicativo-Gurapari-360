import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/src/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color }: { color: string }) => <Ionicons name={name} color={color} size={22} />;

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.ocean, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 66, paddingTop: 6, backgroundColor: colors.card, borderTopColor: colors.line }, tabBarLabelStyle: { fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('home-outline') }}/>
    <Tabs.Screen name="explorar" options={{ title: 'Explorar', tabBarIcon: icon('compass-outline') }}/>
    <Tabs.Screen name="salvos" options={{ title: 'Salvos', tabBarIcon: icon('heart-outline') }}/>
    <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('person-outline') }}/>
  </Tabs>;
}
