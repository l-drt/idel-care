import { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, KeyboardAwareScrollView } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Renseignez email et mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      const { pending2FA: next } = useAuthStore.getState();
      if (next?.needMethodChoice) {
        router.replace('/(auth)/choose-2fa');
      } else if (next?.qrCode || next?.secret) {
        router.replace('/(auth)/setup-2fa');
      } else if (next?.userId) {
        router.replace('/(auth)/verify-2fa');
      }
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardVerticalOffset={20}
      >
          <View style={styles.card}>
            <Text variant="headlineMedium" style={styles.title}>
              IDEL Care
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Connectez-vous à votre espace
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="vous@exemple.fr"
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
            />

            <Button variant="primary" onPress={handleLogin} loading={loading} disabled={loading}>
              Connexion
            </Button>

            <Button variant="text" onPress={() => router.push('/(auth)/inscription')} compact>
              Pas encore de compte ?
            </Button>
          </View>
      </KeyboardAwareScrollView>
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
  title: { textAlign: 'center', fontWeight: '700', color: colors.primary, marginBottom: 6 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: 28 },
});
