import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { getWeather, type WeatherSnapshot } from '@/src/services/weather';
import { colors, radius } from '@/src/theme';

type Props = { latitude: number; longitude: number };

export function BeachWeather({ latitude, longitude }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['beach-weather', latitude, longitude],
    queryFn: () => getWeather(latitude, longitude),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) return <WeatherShell><Text style={styles.loading}>Atualizando clima em tempo real…</Text></WeatherShell>;
  if (isError || !data) return <WeatherShell><Text style={styles.loading}>Não foi possível atualizar o clima agora.</Text></WeatherShell>;

  const recommendation = getRecommendation(data);
  return (
    <WeatherShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CLIMA AGORA</Text>
          <Text style={styles.condition}>{conditionLabel(data.weatherCode)}</Text>
        </View>
        <Ionicons name={weatherIcon(data.weatherCode, data.isDay)} size={34} color={colors.aqua} />
      </View>

      <View style={styles.temperatureRow}>
        <Text style={styles.temperature}>{Math.round(data.temperature)}°</Text>
        <Text style={styles.feels}>Sensação de {Math.round(data.feelsLike)}°</Text>
      </View>

      <View style={[styles.recommendation, recommendation.good ? styles.recommendationGood : styles.recommendationCaution]}>
        <Ionicons name={recommendation.good ? 'checkmark-circle' : 'alert-circle'} size={20} color={recommendation.good ? colors.aqua : '#FFD166'} />
        <View style={styles.recommendationCopy}>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationText}>{recommendation.text}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric icon="water-outline" label="Chuva" value={`${Math.round(data.rainChance)}%`} />
        <Metric icon="flag-outline" label="Vento" value={`${Math.round(data.windSpeed)} km/h`} />
        <Metric icon="sunny-outline" label="UV" value={data.uvIndex.toFixed(0)} />
      </View>
    </WeatherShell>
  );
}

function WeatherShell({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.metric}><Ionicons name={icon} size={16} color={colors.aqua} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function getRecommendation(weather: WeatherSnapshot) {
  const severeWeather = weather.weatherCode >= 80 || weather.weatherCode === 95;
  const rainy = weather.rainChance >= 55 || weather.precipitation >= 1;
  const strongWind = weather.windSpeed >= 32;
  if (severeWeather || rainy || strongWind) {
    const reason = severeWeather ? 'Há condição de tempestade.' : rainy ? 'A chance de chuva está alta.' : 'O vento está forte.';
    return { good: false, title: 'Melhor planejar outro horário', text: `${reason} Acompanhe o clima antes de sair.` };
  }
  if (weather.uvIndex >= 8) return { good: true, title: 'Bom dia para praia, com proteção', text: 'Use protetor solar, boné e procure sombra nos horários de sol forte.' };
  return { good: true, title: 'Ótimo dia para curtir a praia', text: 'Condições favoráveis para aproveitar o litoral.' };
}

function conditionLabel(code: number) {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 67) return 'Chuva fraca';
  if (code <= 77) return 'Chuva';
  if (code <= 82) return 'Pancadas de chuva';
  return 'Tempestade';
}

function weatherIcon(code: number, isDay: boolean): keyof typeof Ionicons.glyphMap {
  if (code <= 1) return isDay ? 'sunny-outline' : 'moon-outline';
  if (code <= 3) return 'partly-sunny-outline';
  if (code >= 80) return 'thunderstorm-outline';
  if (code >= 51) return 'rainy-outline';
  return 'cloudy-outline';
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, marginTop: 28, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.aqua, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  condition: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 4 },
  temperatureRow: { alignItems: 'baseline', flexDirection: 'row', gap: 10, marginTop: 12 },
  temperature: { color: colors.ink, fontSize: 42, fontWeight: '900' },
  feels: { color: colors.muted, fontSize: 13 },
  recommendation: { alignItems: 'flex-start', borderRadius: radius.sm, flexDirection: 'row', gap: 10, marginTop: 14, padding: 12 },
  recommendationGood: { backgroundColor: '#123F48' },
  recommendationCaution: { backgroundColor: '#493A20' },
  recommendationCopy: { flex: 1 },
  recommendationTitle: { color: colors.ink, fontWeight: '900' },
  recommendationText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metric: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm, flex: 1, gap: 3, paddingVertical: 10 },
  metricLabel: { color: colors.muted, fontSize: 11 },
  metricValue: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  loading: { color: colors.muted, textAlign: 'center' },
});
