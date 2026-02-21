import { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { AddressSearchInput, Button, Input, KeyboardAwareScrollView } from '@/components';
import { api } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

/** Formate la saisie en JJ/MM/AAAA avec les / ajoutés automatiquement. */
function formatDateJJMMAAAA(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Convertit JJ/MM/AAAA en YYYY-MM-DD pour l'API. */
function toISODate(jjmmaaaa: string): string | null {
  const match = jjmmaaaa.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, jj, mm, aaaa] = match;
  return `${aaaa}-${mm}-${jj}`;
}

export default function PatientAddScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      Alert.alert('Consentement requis', 'Vous devez attester que le patient a donné son consentement pour le traitement de ses données.');
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
      await api.createPatient(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDateISO,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        consentGiven: consentChecked,
        consentDate: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Succès', 'Patient ajouté.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible d\'ajouter le patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          <Text variant="bodyLarge" style={styles.backLabel}>Annuler</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardVerticalOffset={0}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Nouveau patient
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Renseignez les informations du patient (champs avec * obligatoires).
        </Text>

        <Input
          label="Prénom *"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Prénom"
          autoCapitalize="words"
        />
        <Input
          label="Nom *"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Nom"
          autoCapitalize="words"
        />
        <Input
          label="Date de naissance *"
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatDateJJMMAAAA(text))}
          placeholder="JJ/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />

        <AddressSearchInput
          label="Rechercher une adresse"
          placeholder="Tapez une adresse, ville ou code postal..."
          onSelect={(s) => {
            setAddress(s.address);
            setCity(s.city);
            setPostalCode(s.postalCode);
            setLatitude(s.latitude ?? null);
            setLongitude(s.longitude ?? null);
          }}
        />
        <Input
          label="Adresse *"
          value={address}
          onChangeText={setAddress}
          placeholder="Numéro et rue"
        />
        <Input
          label="Ville *"
          value={city}
          onChangeText={setCity}
          placeholder="Ville"
        />
        <Input
          label="Code postal *"
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Code postal"
          keyboardType="numeric"
        />
        <Input
          label="Téléphone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Téléphone"
          keyboardType="phone-pad"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setConsentChecked((v) => !v)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={consentChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={consentChecked ? colors.primary : colors.textMuted}
          />
          <Text variant="bodyMedium" style={styles.consentLabel}>
            Le patient a donné son consentement pour le traitement de ses données dans l'application. *
          </Text>
        </TouchableOpacity>

        <Button
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !consentChecked}
          style={styles.submitButton}
        >
          Enregistrer le patient
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLabel: {
    color: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 24,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  consentLabel: {
    flex: 1,
    color: colors.text,
  },
  submitButton: {
    marginTop: 24,
  },
});
