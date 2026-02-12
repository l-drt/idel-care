import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button, Input } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les deux mots de passe ne correspondent pas.');
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
      await api.changePassword(token, currentPassword, newPassword);
      Alert.alert('Succès', 'Mot de passe modifié.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Changer le mot de passe
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Saisissez votre mot de passe actuel puis le nouveau (8 caractères minimum).
        </Text>

        <Input
          label="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
          style={styles.input}
        />
        <Input
          label="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="••••••••"
          style={styles.input}
        />
        <Input
          label="Confirmer le nouveau mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="••••••••"
          style={styles.input}
        />

        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          style={styles.btn}
        >
          Modifier le mot de passe
        </Button>
        <Button variant="text" onPress={() => router.back()} compact>
          Annuler
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 16 },
  title: { fontWeight: '700', color: colors.primary, marginBottom: 8 },
  subtitle: { color: colors.textMuted, marginBottom: 24 },
  input: { marginBottom: 16 },
  btn: { marginTop: 8 },
});
