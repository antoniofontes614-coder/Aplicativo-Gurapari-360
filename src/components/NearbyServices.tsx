import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/src/theme';

type Service = {
  label: string;
  query: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const nearbyServices: readonly Service[] = [
  { label: 'Estacionamentos', query: 'estacionamento', icon: 'car-outline' },
  { label: 'Restaurantes', query: 'restaurantes', icon: 'restaurant-outline' },
  { label: 'Hotéis e Pousadas', query: 'hotéis e pousadas', icon: 'bed-outline' },
  { label: 'Farmácias', query: 'farmácia', icon: 'medkit-outline' },
  { label: 'Postos de Combustível', query: 'posto de combustível', icon: 'flame-outline' },
  { label: 'Supermercados', query: 'supermercado', icon: 'cart-outline' },
  { label: 'Pontos de ônibus', query: 'ponto de ônibus', icon: 'bus-outline' },
  { label: 'Aluguel de bicicletas', query: 'aluguel de bicicletas', icon: 'bicycle-outline' },
  { label: 'Hospitais e Pronto Atendimento', query: 'hospital pronto atendimento', icon: 'medical-outline' },
  { label: 'Bancos e Caixas Eletrônicos', query: 'banco caixa eletrônico', icon: 'card-outline' },
  { label: 'Banheiros Públicos', query: 'banheiro público', icon: 'woman-outline' },
  { label: 'Passeios Turísticos', query: 'passeios turísticos', icon: 'compass-outline' },
];

export function buildNearbyServiceUrl(service: Service, beachName: string, latitude: number, longitude: number) {
  const coordinates = `${latitude},${longitude}`;
  const query = `${service.query} perto de ${beachName}, Guarapari, Espírito Santo (${coordinates})`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function NearbyServices({ beachName, latitude, longitude }: { beachName: string; latitude: number; longitude: number }) {
  const openService = (service: Service) => {
    const url = buildNearbyServiceUrl(service, beachName, latitude, longitude);
    if (Platform.OS === 'web') window.open(url, '_blank', 'noopener,noreferrer');
    else void Linking.openURL(url);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Serviços Próximos</Text>
      <Text style={styles.subtitle}>Encontre o que precisa perto desta praia.</Text>
      <View style={styles.grid}>
        {nearbyServices.map((service) => (
          <Pressable key={service.label} accessibilityRole="button" accessibilityLabel={`Buscar ${service.label} no Google Maps`} onPress={() => openService(service)} style={styles.card}>
            <Ionicons name={service.icon} size={22} color={colors.aqua} />
            <Text style={styles.label} numberOfLines={2}>{service.label}</Text>
            <Ionicons name="open-outline" size={15} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 20, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  card: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 9, minHeight: 58, paddingHorizontal: 12, paddingVertical: 10, width: '48%' },
  label: { color: colors.ink, flex: 1, flexShrink: 1, fontSize: 13, fontWeight: '700', lineHeight: 17 },
});
