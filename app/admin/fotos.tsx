import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { beaches } from '@/src/data/beaches';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/store/auth';
import { colors, radius } from '@/src/theme';

export default function PhotoAdminScreen() {
  const session = useAuth((state) => state.session);
  const role = useAuth((state) => state.role);
  const queryClient = useQueryClient();
  const inputRef = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(beaches[0].id);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const selectedBeach = beaches.find((beach) => beach.id === selectedId) ?? beaches[0];
  const visibleBeaches = beaches.filter((beach) => beach.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).slice(0, 8);
  const isAdmin = role === 'admin';
  const { data: photos = [] } = useQuery({
    queryKey: ['beach-photos', selectedBeach.id],
    enabled: Boolean(supabase) && isAdmin,
    queryFn: async () => {
      if (!supabase) return [] as Photo[];
      const { data, error } = await supabase.from('beach_photos').select('id, storage_path, caption').eq('beach_slug', selectedBeach.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
  });

  const chooseFile = () => inputRef.current?.click();
  const onFileChange = (event: any) => {
    const nextFile = event.target?.files?.[0] as File | undefined;
    if (nextFile) {
      setFile(nextFile);
      setMessage('');
    }
  };

  const upload = async () => {
    if (!supabase || !file || !isAdmin) return;
    if (!file.type.startsWith('image/')) return setMessage('Escolha uma imagem em JPG, PNG ou WEBP.');
    if (file.size > 6 * 1024 * 1024) return setMessage('A imagem deve ter no máximo 6 MB.');
    setSending(true);
    setMessage('Enviando foto…');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${selectedBeach.id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('beach-gallery').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });
    if (uploadError) {
      setMessage(uploadError.message);
      setSending(false);
      return;
    }
    const { error: recordError } = await supabase.from('beach_photos').insert({ beach_slug: selectedBeach.id, storage_path: path, caption: caption.trim() || null });
    if (recordError) {
      await supabase.storage.from('beach-gallery').remove([path]);
      setMessage(recordError.message);
      setSending(false);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['beach-photos', selectedBeach.id] });
    setFile(null);
    setCaption('');
    setMessage('Foto adicionada com sucesso. Ela já aparece na página da praia.');
    setSending(false);
  };

  const removePhoto = (photo: Photo) => {
    Alert.alert('Apagar foto?', 'A foto será removida da página da praia e do armazenamento.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => { void confirmRemovePhoto(photo); } },
    ]);
  };

  const confirmRemovePhoto = async (photo: Photo) => {
    if (!supabase || !isAdmin) return;
    setSending(true);
    setMessage('Apagando foto…');
    const { error: recordError } = await supabase.from('beach_photos').delete().eq('id', photo.id);
    if (recordError) {
      setMessage(recordError.message);
      setSending(false);
      return;
    }
    const { error: storageError } = await supabase.storage.from('beach-gallery').remove([photo.storage_path]);
    await queryClient.invalidateQueries({ queryKey: ['beach-photos', selectedBeach.id] });
    setMessage(storageError ? 'A foto foi ocultada, mas o arquivo será removido posteriormente.' : 'Foto apagada com sucesso.');
    setSending(false);
  };

  if (!session) return <AccessScreen text="Entre com sua conta para administrar as fotos." />;
  if (!isAdmin) return <AccessScreen text="Esta área está disponível somente para a conta administradora." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.ink} /></Pressable>
        <Text style={styles.eyebrow}>ADMINISTRAÇÃO</Text>
        <Text style={styles.title}>Adicionar foto</Text>
        <Text style={styles.text}>Escolha uma praia, envie a imagem e ela aparecerá automaticamente na página correspondente.</Text>

        <Text style={styles.label}>Praia</Text>
        <TextInput value={search} onChangeText={setSearch} placeholder="Buscar praia" placeholderTextColor={colors.muted} style={styles.input} />
        <View style={styles.beachList}>{visibleBeaches.map((beach) => <Pressable key={beach.id} onPress={() => { setSelectedId(beach.id); setSearch(beach.name); }} style={[styles.beachOption, beach.id === selectedId && styles.beachOptionActive]}><Text style={styles.beachName}>{beach.name}</Text></Pressable>)}</View>

        <Text style={styles.label}>Legenda (opcional)</Text>
        <TextInput value={caption} onChangeText={setCaption} placeholder="Ex.: Vista da praia ao amanhecer" placeholderTextColor={colors.muted} style={styles.input} />

        {Platform.OS === 'web' ? <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onFileChange} /> : null}
        <Pressable onPress={chooseFile} style={styles.choose}><Ionicons name="image-outline" size={22} color={colors.aqua} /><Text style={styles.chooseText}>{file ? file.name : 'Escolher imagem'}</Text></Pressable>
        <Text style={styles.hint}>Formatos JPG, PNG ou WEBP — até 6 MB.</Text>
        <Pressable disabled={!file || sending} onPress={upload} style={[styles.send, (!file || sending) && styles.disabled]}><Text style={styles.sendText}>{sending ? 'Enviando…' : 'Adicionar foto à praia'}</Text></Pressable>
        {!!message && <Text style={styles.message}>{message}</Text>}
        <Text style={styles.label}>Fotos desta praia</Text>
        {!photos.length ? <Text style={styles.text}>Nenhuma foto enviada para esta praia.</Text> : <View style={styles.photoList}>{photos.map((photo) => {
          const { data: url } = supabase?.storage.from('beach-gallery').getPublicUrl(photo.storage_path) ?? { data: { publicUrl: '' } };
          return <View key={photo.id} style={styles.photoCard}><Image source={{ uri: url.publicUrl }} style={styles.photoPreview} /><View style={styles.photoInfo}><Text numberOfLines={2} style={styles.photoCaption}>{photo.caption || 'Sem legenda'}</Text><Pressable disabled={sending} onPress={() => removePhoto(photo)} style={styles.delete}><Ionicons name="trash-outline" size={17} color={colors.onPrimary} /><Text style={styles.deleteText}>Apagar</Text></Pressable></View></View>;
        })}</View>}
      </ScrollView>
    </SafeAreaView>
  );
}

type Photo = { id: string; storage_path: string; caption: string | null };

function AccessScreen({ text }: { text: string }) {
  return <SafeAreaView style={styles.safe}><View style={styles.access}><Text style={styles.title}>Fotos das praias</Text><Text style={styles.text}>{text}</Text><Pressable onPress={() => router.replace('/perfil')} style={styles.send}><Text style={styles.sendText}>Ir para o perfil</Text></Pressable></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 22, paddingBottom: 42 },
  access: { padding: 24, gap: 16 },
  back: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', marginBottom: 24, width: 44 },
  eyebrow: { color: colors.aqua, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', marginTop: 7 },
  text: { color: colors.muted, lineHeight: 22, marginTop: 9 },
  label: { color: colors.ink, fontWeight: '800', marginTop: 24, marginBottom: 8 },
  input: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, color: colors.ink, padding: 14 },
  beachList: { gap: 7, marginTop: 9 },
  beachOption: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, padding: 12 },
  beachOptionActive: { borderColor: colors.aqua, backgroundColor: colors.sand },
  beachName: { color: colors.ink, fontWeight: '700' },
  choose: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.sm, borderStyle: 'dashed', borderWidth: 1, flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 14, minHeight: 74, paddingHorizontal: 16 },
  chooseText: { color: colors.ink, flexShrink: 1, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 12, marginTop: 8 },
  send: { alignItems: 'center', backgroundColor: colors.ocean, borderRadius: radius.pill, marginTop: 22, padding: 16 },
  disabled: { opacity: 0.5 },
  sendText: { color: colors.onPrimary, fontWeight: '900' },
  message: { color: colors.aqua, lineHeight: 21, marginTop: 14, textAlign: 'center' },
  photoList: { gap: 10 },
  photoCard: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 12, overflow: 'hidden', padding: 10 },
  photoPreview: { backgroundColor: colors.line, borderRadius: radius.sm, height: 70, width: 92 },
  photoInfo: { flex: 1, gap: 8 },
  photoCaption: { color: colors.ink, fontWeight: '700' },
  delete: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.coral, borderRadius: radius.pill, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 8 },
  deleteText: { color: colors.onPrimary, fontSize: 12, fontWeight: '900' },
});
