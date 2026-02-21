import { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Button, KeyboardAwareScrollView } from '@/components';
import { api } from '@/services/api';
import type { PatientResponse } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function InfoRow({
  icon,
  label,
  value,
}: { icon: string; label: string; value: string | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon as any} size={20} color={colors.textMuted} />
      <View style={styles.infoText}>
        <Text variant="bodySmall" style={styles.infoLabel}>{label}</Text>
        <Text variant="bodyMedium">{value}</Text>
      </View>
    </View>
  );
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

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
      const data = await api.getPatient(token, id);
      setPatient(data);
      hasLoadedOnce.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger le patient.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  useFocusEffect(
    useCallback(() => {
      if (!id || !hasLoadedOnce.current) return;
      loadPatient();
    }, [id, loadPatient])
  );

  const handleDelete = useCallback(() => {
    if (!id) return;
    Alert.alert(
      'Supprimer le patient',
      'Le patient sera supprimé de votre liste (droit à l\'oubli). Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (!token) {
              Alert.alert('Erreur', 'Session expirée.');
              return;
            }
            setDeleting(true);
            try {
              await api.deletePatient(token, id);
              router.back();
            } catch (e) {
              Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de supprimer.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [id]);

  if (!id) {
    router.back();
    return null;
  }

  if (loading && !patient) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
            <Text variant="bodyLarge" style={styles.backLabel}>Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !patient) {
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

  const p = patient!;
  const fullName = `${p.firstName} ${p.lastName}`.trim() || 'Sans nom';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          <Text variant="bodyLarge" style={styles.backLabel}>Retour</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardVerticalOffset={0}
      >
        <View style={styles.avatarWrap}>
          <MaterialCommunityIcons name="account-circle" size={72} color={colors.primary} />
        </View>
        <Text variant="headlineMedium" style={styles.name}>
          {fullName}
        </Text>
        {p.birthDate ? (
          <Text variant="bodyMedium" style={styles.birth}>
            Né(e) le {formatBirthDate(p.birthDate)}
          </Text>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Coordonnées</Text>
          <InfoRow icon="map-marker" label="Adresse" value={p.address} />
          <InfoRow
            icon="city"
            label="Ville"
            value={[p.city, p.postalCode].filter(Boolean).join(' ') || undefined}
          />
          <InfoRow icon="phone" label="Téléphone" value={p.phone ?? undefined} />
          <InfoRow icon="email" label="Email" value={p.email ?? undefined} />
        </View>

        {(p.allergies?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Allergies</Text>
            <Text variant="bodyMedium">{p.allergies!.join(', ')}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={() => router.push(`/patient/${id}/edit`)}
            disabled={deleting}
            style={styles.actionButton}
          >
            Modifier
          </Button>
          <Button
            variant="text"
            onPress={handleDelete}
            disabled={deleting}
            style={[styles.actionButton, styles.deleteButton]}
          >
            Supprimer le patient
          </Button>
        </View>
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
  backLabel: { color: colors.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: colors.error, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  name: { textAlign: 'center', fontWeight: '700', color: colors.text, marginBottom: 4 },
  birth: { textAlign: 'center', color: colors.textMuted, marginBottom: 24 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: { flex: 1 },
  infoLabel: { color: colors.textMuted, marginBottom: 2 },
  actions: { marginTop: 24, gap: 12 },
  actionButton: { width: '100%' },
  deleteButton: { color: colors.error },
});
