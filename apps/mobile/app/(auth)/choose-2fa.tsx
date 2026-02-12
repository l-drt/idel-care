import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const METHODS: { id: 'TOTP' | 'SMS' | 'EMAIL'; label: string; description: string }[] = [
  {
    id: 'TOTP',
    label: 'Application d’authentification',
    description: 'Google Authenticator ou similaire (recommandé)',
  },
  {
    id: 'SMS',
    label: 'Code par SMS',
    description: 'Code envoyé à votre numéro de téléphone',
  },
  {
    id: 'EMAIL',
    label: 'Code par email',
    description: 'Code envoyé à votre adresse email',
  },
];

export default function Choose2FAScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const { pending2FA, choose2FAMethod } = useAuthStore();

  useEffect(() => {
    if (!pending2FA?.userId) {
      router.replace('/(auth)/login');
      return;
    }
    // Rester sur cet écran tant qu'on doit choisir la méthode
    if (pending2FA.needMethodChoice) return;
    // Après choix : on a qrCode/secret (TOTP) ou method (SMS/Email) — ne pas rediriger vers login, handleChoose fera la nav
    if (pending2FA.qrCode || pending2FA.secret || pending2FA.method) return;
    router.replace('/(auth)/login');
  }, [pending2FA]);

  const handleChoose = async (method: 'TOTP' | 'SMS' | 'EMAIL') => {
    if (!pending2FA?.userId) return;
    setLoading(method);
    try {
      await choose2FAMethod(pending2FA.userId, method);
      const { pending2FA: next } = useAuthStore.getState();
      if (next?.qrCode || next?.secret) {
        router.replace('/(auth)/setup-2fa');
      } else if (next?.userId && (next?.method === 'SMS' || next?.method === 'EMAIL')) {
        router.replace('/(auth)/verify-2fa');
      }
    } catch (e) {
      Alert.alert(
        'Erreur',
        e instanceof Error ? e.message : 'Impossible de configurer cette méthode.',
      );
    } finally {
      setLoading(null);
    }
  };

  if (!pending2FA?.userId || !pending2FA?.needMethodChoice) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text variant="headlineMedium" style={styles.title}>
            Choisir la double authentification
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sélectionnez comment vous souhaitez recevoir le code de vérification à chaque connexion.
          </Text>

          {METHODS.map((m) => (
            <View key={m.id} style={styles.methodWrap}>
              <Button
                variant="secondary"
                onPress={() => handleChoose(m.id)}
                loading={loading === m.id}
                disabled={!!loading}
                style={styles.methodBtn}
              >
                {m.label}
              </Button>
              <Text variant="bodySmall" style={styles.methodDesc}>
                {m.description}
              </Text>
            </View>
          ))}

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
  scrollContent: { flexGrow: 1, padding: 24, paddingVertical: 28 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  title: { textAlign: 'center', fontWeight: '700', color: colors.primary, marginBottom: 8 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: 24 },
  methodWrap: { marginBottom: 16 },
  methodBtn: { marginBottom: 4 },
  methodDesc: { color: colors.textMuted, marginLeft: 4 },
});
