import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme';

type Props = { name: string; uri?: string; height?: number };

const fallbackImage = require('../../assets/guarapari-360-header.png');
const verifiedBeachPhotos: Record<string, string> = {
  'Praia do Morro': 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia%20do%20Morro.jpg?width=1200',
};

export function BeachVisual({ name, uri, height = 170 }: Props) {
  const source = uri ?? verifiedBeachPhotos[name] ?? fallbackImage;

  return (
    <View style={[styles.container, { height }]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} cachePolicy="memory-disk" />
      <View style={styles.label}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.caption}>{uri || verifiedBeachPhotos[name] ? 'Foto real da praia' : 'Guarapari · acervo em atualização'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.ocean, justifyContent: 'flex-end' },
  label: { padding: 16 },
  name: { color: 'white', fontSize: 22, fontWeight: '800', textShadowColor: 'rgba(0,0,0,.45)', textShadowRadius: 5 },
  caption: { color: 'white', marginTop: 3, textShadowColor: 'rgba(0,0,0,.45)', textShadowRadius: 4 },
});
