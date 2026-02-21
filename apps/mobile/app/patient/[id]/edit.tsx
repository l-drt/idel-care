import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Button, Input, KeyboardAwareScrollView } from '@/components';
import { api } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

function formatDateJJMMAAAA(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toISODate(jjmmaaaa: string): string | null {
  const match = jjmmaaaa.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, jj, mm, aaaa] = match;
  return `${aaaa}-${mm}-${jj}`;
}

/** ISO date (YYYY-MM-DD) to JJ/MM/AAAA */
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

export default function PatientEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);

  const loadPatient = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      setError('Session expirée.');
      setLoading(false);
      return;
    }
    try {
      const p = await api.getPatient(token, id);
      setFirstName(p.firstName ?? '');
      setLastName(p.lastName ?? '');
      setBirthDate(p.birthDate ? isoToDisplay(p.birthDate) : '');
      setAddress(p.address ?? '');
      setCity(p.city ?? '');
      setPostalCode(p.postalCode ?? '');
      setPhone(p.phone ?? '');
      setEmail(p.email ?? '');
      setConsentChecked(p.consentGiven ?? true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger le patient.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const handleSubmit = async () => {
    if (!id) return;
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }
    const birthDateISO = toISODate(birthDate);
    if (!birthDateISO) {
      Alert.alert('Erreur', 'Date de naissance invalide. Utilisez le format JJ/MM/AAAA.');
      return;
    }
    if (!address.trim() || !city.trim() || !postalCode.trim()) {
      Alert.alert('Erreur', 'L\'adresse, la ville et le code postal sont obligatoires.');
      return;
    }
    if (!consentChecked) {
      Alert.alert('Consentement requis', 'Vous devez attester que le patient a donné son consentement.');
      return;
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      Alert.alert('Erreur', 'Session expirée.');
      router.replace('/(auth)/login');
      return;
    }
    setSaving(true);
    try {
      await api.updatePatient(token, id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDateISO,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        consentGiven: consentChecked,
        consentDate: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Enregistré', 'Les informations du patient ont été mises à jour.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible d\'enregistrer.');
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    router.back();
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
            <Text variant="bodyLarge" style={styles.backLabel}>Annuler</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
            <Text variant="bodyLarge" style={styles.backLabel}>Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          <Text variant="bodyLarge" style={styles.backLabel}>Annuler</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardVerticalOffset={0}>
        <Text variant="headlineMedium" style={styles.title}>
          Modifier le patient
        </Text>

        <Input label="Prénom *" value={firstName} onChangeText={setFirstName} placeholder="Prénom" autoCapitalize="words" />
        <Input label="Nom *" value={lastName} onChangeText={setLastName} placeholder="Nom" autoCapitalize="words" />
        <Input
          label="Date de naissance *"
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatDateJJMMAAAA(text))}
          placeholder="JJ/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />
        <Input label="Adresse *" value={address} onChangeText={setAddress} placeholder="Numéro et rue" />
        <Input label="Ville *" value={city} onChangeText={setCity} placeholder="Ville" />
        <Input
          label="Code postal *"
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Code postal"
          keyboardType="numeric"
        />
        <Input label="Téléphone" value={phone} onChangeText={setPhone} placeholder="Téléphone" keyboardType="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />

        <TouchableOpacity style={styles.consentRow} onPress={() => setConsentChecked((v) => !v)} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={consentChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={consentChecked ? colors.primary : colors.textMuted}
          />
          <Text variant="bodyMedium" style={styles.consentLabel}>
            Le patient a donné son consentement pour le traitement de ses données dans l'application.
          </Text>
        </TouchableOpacity>

        <Button onPress={handleSubmit} loading={saving} disabled={saving || !consentChecked} style={styles.submitButton}>
          Enregistrer les modifications
        </Button>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backLabel: { color: colors.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: colors.error, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { marginBottom: 24 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20, marginBottom: 8 },
  consentLabel: { flex: 1, color: colors.text },
  submitButton: { marginTop: 24 },
});
