import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Image, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { setStringAsync as copyToClipboard, isClipboardAvailable } from '@/utils/safe-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, KeyboardAwareScrollView } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const QR_SIZE = 160;

export default function Setup2FAScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { pending2FA, isAuthenticated, enable2FA } = useAuthStore();

  useEffect(() => {
    if (!pending2FA) {
      if (!isAuthenticated) router.replace('/(auth)/login');
      return;
    }
    if (pending2FA.userId && (pending2FA.secret || pending2FA.qrCode)) return; // Écran valide
    if (isAuthenticated) return;
    if (!pending2FA.userId) {
      router.replace('/(auth)/login');
      return;
    }
    if (!pending2FA.secret && !pending2FA.qrCode) {
      router.replace('/(auth)/choose-2fa');
    }
  }, [pending2FA, isAuthenticated]);

  const handleCopySecret = async () => {
    if (!pending2FA?.secret) return;
    await copyToClipboard(pending2FA.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!pending2FA?.userId || code.length !== 6) {
      Alert.alert('Erreur', 'Entrez le code à 6 chiffres de votre application d’authentification.');
      return;
    }
    setLoading(true);
    try {
      await enable2FA(pending2FA.userId, code);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  if (!pending2FA?.userId && !isAuthenticated) return null;
  if (!pending2FA) return null;

  const hasSecret = !!pending2FA.secret;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardVerticalOffset={20}>
        <View style={styles.card}>
          <Text variant="headlineMedium" style={styles.title}>
            Activer la 2FA
          </Text>

          {hasSecret ? (
            <>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Sur ce téléphone, utilisez la <Text style={styles.bold}>clé secrète</Text> (pas le QR
                code). Dans Google Authenticator : « Ajouter un compte » → « Saisir une clé de
                configuration » → collez la clé ci‑dessous.
              </Text>

              <TouchableOpacity style={styles.secretBox} onLongPress={handleCopySecret}>
                <Text selectable style={styles.secretText}>
                  {pending2FA.secret}
                </Text>
              </TouchableOpacity>

              {isClipboardAvailable() && (
                <Button
                  variant="secondary"
                  onPress={handleCopySecret}
                  style={styles.copyBtn}
                  compact
                >
                  {copied ? 'Copié !' : 'Copier la clé'}
                </Button>
              )}

              <Text variant="bodySmall" style={styles.hint}>
                Puis saisissez le code à 6 chiffres affiché par l’app d’authentification.
              </Text>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.subtitle}>
              Scannez le QR code avec une app d’authentification (sur un autre appareil), puis
              saisissez le code à 6 chiffres.
            </Text>
          )}

          {pending2FA?.qrCode && (
            <View style={styles.qrSection}>
              <Text variant="labelSmall" style={styles.qrLabel}>
                Ou scannez ce QR (autre appareil)
              </Text>
              <View style={[styles.qrWrap, { width: QR_SIZE, height: QR_SIZE }]}>
                <Image
                  source={{ uri: pending2FA.qrCode }}
                  style={{ width: QR_SIZE, height: QR_SIZE }}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}

          <Input
            label="Code à 6 chiffres"
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
            Valider et me connecter
          </Button>

          <Button variant="text" onPress={() => router.replace('/(auth)/login')} compact>
            Retour à la connexion
          </Button>
        </View>
      </KeyboardAwareScrollView>
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
    alignItems: 'center',
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
  title: { textAlign: 'center', fontWeight: '700', color: colors.primary, marginBottom: 12 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: 16 },
  bold: { fontWeight: '600' },
  secretBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  secretText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
  copyBtn: { marginBottom: 16 },
  hint: { textAlign: 'center', color: colors.textMuted, marginBottom: 20 },
  qrSection: { marginBottom: 20, alignItems: 'center' },
  qrLabel: { color: colors.textMuted, marginBottom: 8 },
  qrWrap: { marginBottom: 0 },
  input: { width: '100%', marginBottom: 4 },
});
