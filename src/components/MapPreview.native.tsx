import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, StyleSheet } from 'react-native';
import type { Beach } from '@/src/types';

export function MapPreview({ beach }: { beach: Beach }) { return <MapView style={StyleSheet.absoluteFill} provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} mapType="satellite" initialRegion={{ latitude: beach.latitude, longitude: beach.longitude, latitudeDelta: .015, longitudeDelta: .015 }}><Marker coordinate={{ latitude: beach.latitude, longitude: beach.longitude }} title={beach.name}/></MapView>; }
