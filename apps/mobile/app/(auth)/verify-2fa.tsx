import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

export default function Verify2FAScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { pending2FA, isAuthenticated, verify2FA } = useAuthStore();

  useEffect(() => {
    if (pending2FA?.userId) return; // Écran valide : on a un userId en attente de code
    if (isAuthenticated) return;   // Connexion venant de réussir : handleSubmit va naviguer vers (tabs)
    router.replace('/(auth)/login');
  }, [pending2FA, isAuthenticated]);

  const handleSubmit = async () => {
    if (!pending2FA?.userId || code.length !== 6) {
      Alert.alert('Erreur', 'Entrez le code à 6 chiffres.');
      return;
    }
    setLoading(true);
    try {
      await verify2FA(pending2FA.userId, code);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  if (!pending2FA?.userId && !isAuthenticated) return null;

  const method = pending2FA?.method ?? 'TOTP';
  const subtitle =
    method === 'SMS'
      ? 'Un code à 6 chiffres a été envoyé par SMS à votre numéro. Saisissez-le ci-dessous.'
      : method === 'EMAIL'
        ? 'Un code à 6 chiffres a été envoyé à votre adresse email. Saisissez-le ci-dessous.'
        : 'Entrez le code à 6 chiffres affiché par votre application d\'authentification.';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text variant="headlineMedium" style={styles.title}>
            Code 2FA
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>

          <Input
            label="Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            style={styles.input}
          />

          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || code.length !== 6}
          >
            Valider
          </Button>

          <Button variant="text" onPress={() => router.replace('/(auth)/login')} compact>
            Retour à la connexion
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  title: { textAlign: 'center', fontWeight: '700', color: colors.primary, marginBottom: 8 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: 24 },
  input: { marginBottom: 4 },
});
