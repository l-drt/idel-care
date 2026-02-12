import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input } from '@/components';
import { api } from '@/services/api';
import { colors } from '@/theme';

export default function InscriptionScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'Le prénom est requis';
    if (!lastName.trim()) next.lastName = 'Le nom est requis';
    if (!email.trim()) next.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email invalide';
    if (!password) next.password = 'Le mot de passe est requis';
    else if (password.length < 8) next.password = 'Minimum 8 caractères';
    if (password !== confirmPassword) next.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      Alert.alert(
        'Compte créé',
        'Connectez-vous pour activer la double authentification (2FA).',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur lors de l’inscription.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text variant="headlineMedium" style={styles.title}>
              Inscription
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Créez votre compte pour accéder à IDEL Care
            </Text>

            <Input
              label="Prénom"
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                if (errors.firstName) setErrors((e) => ({ ...e, firstName: '' }));
              }}
              autoCapitalize="words"
              autoComplete="given-name"
              placeholder="Jean"
              error={!!errors.firstName}
              style={styles.input}
            />
            {errors.firstName ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.firstName}
              </Text>
            ) : null}

            <Input
              label="Nom"
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                if (errors.lastName) setErrors((e) => ({ ...e, lastName: '' }));
              }}
              autoCapitalize="words"
              autoComplete="family-name"
              placeholder="Dupont"
              error={!!errors.lastName}
              style={styles.input}
            />
            {errors.lastName ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.lastName}
              </Text>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="jean.dupont@exemple.fr"
              error={!!errors.email}
              style={styles.input}
            />
            {errors.email ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.email}
              </Text>
            ) : null}

            <Input
              label="Téléphone (optionnel)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              style={styles.input}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: '' }));
                if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
              }}
              secureTextEntry
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.password}
              style={styles.input}
            />
            {errors.password ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.password}
              </Text>
            ) : null}

            <Input
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
              }}
              secureTextEntry
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              style={styles.input}
            />
            {errors.confirmPassword ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.confirmPassword}
              </Text>
            ) : null}

            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              S'inscrire
            </Button>

            <Button variant="text" onPress={() => router.back()} compact>
              Déjà un compte ? Connexion
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
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
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 12,
    marginTop: -4,
  },
});
