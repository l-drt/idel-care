import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  hasHardwareAsync,
  isEnrolledAsync,
  authenticateAsync,
} from '@/utils/safe-local-auth';
import { Button, Input, KeyboardAwareScrollView } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { colors } from '@/theme';

export default function UnlockScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState('');
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const { user, needsBiometricUnlock, unlockWithBiometricSuccess, logout } = useAuthStore();

  const runBiometric = useCallback(async () => {
    setError(null);
    setLoading(true);
    setShowPasswordField(false);
    setPassword('');
    try {
      const hasHardware = await hasHardwareAsync();
      const isEnrolled = await isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        unlockWithBiometricSuccess();
        router.replace('/(tabs)');
        return;
      }

      const result = await authenticateAsync({
        promptMessage: 'Déverrouiller IDEL Care',
        cancelLabel: 'Annuler',
      });

      if (result.success) {
        unlockWithBiometricSuccess();
        router.replace('/(tabs)');
      } else {
        if (result.error === 'user_cancel') {
          setError(null);
        } else {
          setError(
            'Échec de la reconnaissance. Réessayez ou déverrouillez avec votre mot de passe.',
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur biométrie');
    } finally {
      setLoading(false);
    }
  }, [unlockWithBiometricSuccess]);

  useEffect(() => {
    if (!needsBiometricUnlock) return;
    runBiometric();
  }, [needsBiometricUnlock, runBiometric]);

  const handleUnlockWithPassword = async () => {
    if (!user?.id || !password.trim()) return;
    setError(null);
    setLoadingUnlock(true);
    try {
      await api.unlockWithPassword(user.id, password);
      unlockWithBiometricSuccess();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mot de passe incorrect.');
    } finally {
      setLoadingUnlock(false);
    }
  };

  const handleUsePasswordClick = () => {
    setError(null);
    setShowPasswordField(true);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!needsBiometricUnlock) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardVerticalOffset={20}
      >
          <View style={styles.centered}>
            <Text variant="headlineMedium" style={styles.title}>
              Déverrouiller l'app
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {loading && !showPasswordField
                ? 'Utilisez Face ID ou Touch ID pour continuer.'
                : showPasswordField
                  ? 'Entrez votre mot de passe pour accéder à l\'app (sans vous déconnecter).'
                  : 'Reconnaissance annulée ou indisponible.'}
            </Text>
            <Text variant="bodySmall" style={styles.fallbackHint}>
              Lunettes, chapeau, mauvaise lumière ? Déverrouillez avec votre mot de passe.
            </Text>
            {error ? (
              <Text variant="bodySmall" style={styles.error}>
                {error}
              </Text>
            ) : null}

            {showPasswordField ? (
              <View style={styles.passwordSection}>
                <Input
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  placeholder="••••••••"
                  style={styles.input}
                  editable={!loadingUnlock}
                />
                <Button
                  variant="primary"
                  onPress={handleUnlockWithPassword}
                  loading={loadingUnlock}
                  disabled={loadingUnlock || !password.trim()}
                  style={styles.btn}
                >
                  Déverrouiller
                </Button>
                <Button
                  variant="text"
                  onPress={() => setShowPasswordField(false)}
                  style={styles.btn}
                  compact
                >
                  Retour à Face ID / Touch ID
                </Button>
              </View>
            ) : (
              <>
                {!loading && (
                  <View style={styles.buttons}>
                    <Button variant="secondary" onPress={runBiometric} style={styles.btn}>
                      Réessayer Face ID / Touch ID
                    </Button>
                    <Button variant="primary" onPress={handleUsePasswordClick} style={[styles.btn, styles.btnSecond]}>
                      Déverrouiller avec le mot de passe
                    </Button>
                  </View>
                )}
                {loading && (
                  <Button variant="text" onPress={handleUsePasswordClick} style={styles.btn} compact>
                    Déverrouiller avec le mot de passe
                  </Button>
                )}
              </>
            )}

            <Button variant="text" onPress={handleLogout} style={styles.logoutLink} compact>
              Se déconnecter
            </Button>
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, minHeight: 400 },
  centered: { alignItems: 'center' },
  title: { fontWeight: '700', color: colors.primary, marginBottom: 8, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: 12 },
  fallbackHint: { textAlign: 'center', color: colors.textMuted, marginBottom: 16, fontStyle: 'italic' },
  error: { textAlign: 'center', color: colors.error, marginBottom: 16 },
  passwordSection: { width: '100%', maxWidth: 320, marginBottom: 16 },
  input: { width: '100%', marginBottom: 8 },
  buttons: { width: '100%' },
  btn: { marginTop: 8 },
  btnSecond: { marginTop: 12 },
  logoutLink: { marginTop: 24 },
});
