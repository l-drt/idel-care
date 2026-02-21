import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button, Input, KeyboardAwareScrollView } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

export default function SupprimerCompteScreen() {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  const CONFIRM_PHRASE = 'SUPPRIMER MON COMPTE';

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      Alert.alert('Erreur', `Veuillez saisir exactement : ${CONFIRM_PHRASE}`);
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe.');
      return;
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      Alert.alert('Erreur', 'Session expirée. Reconnectez-vous.');
      router.replace('/(auth)/login');
      return;
    }
    setLoading(true);
    try {
      await api.deleteAccount(token, password);
      await logout();
      Alert.alert('Compte supprimé', 'Vos données ont été anonymisées. Vous pouvez fermer l’application.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de supprimer le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardVerticalOffset={20}>
        <Text variant="headlineMedium" style={styles.title}>
          Supprimer mon compte
        </Text>
        <Text variant="bodyMedium" style={styles.warning}>
          Cette action est irréversible. Vos données personnelles seront anonymisées et vous ne pourrez plus vous connecter avec ce compte. Les données nécessaires à la traçabilité (conformité HDS) peuvent être conservées sous forme anonymisée.
        </Text>
        <Input
          label="Mot de passe actuel"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
          style={styles.input}
        />
        <Text variant="bodySmall" style={styles.confirmLabel}>
          Pour confirmer, saisissez exactement : {CONFIRM_PHRASE}
        </Text>
        <Input
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder={CONFIRM_PHRASE}
          style={styles.input}
          autoCapitalize="characters"
        />
        <Button
          variant="primary"
          onPress={handleDelete}
          loading={loading}
          disabled={loading || !password || confirmText !== CONFIRM_PHRASE}
          style={styles.deleteBtn}
        >
          Supprimer définitivement mon compte
        </Button>
        <Button variant="text" onPress={() => router.back()} compact>
          Annuler
        </Button>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 16 },
  title: { fontWeight: '700', color: colors.error, marginBottom: 12 },
  warning: { color: colors.textMuted, marginBottom: 24 },
  confirmLabel: { color: colors.textMuted, marginBottom: 8 },
  input: { marginBottom: 16 },
  deleteBtn: { marginTop: 8 },
});
