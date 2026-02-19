import { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import type { PatientResponse } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';

function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split('T')[0].split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function PatientCard({ patient }: { patient: PatientResponse }) {
  const fullName = `${patient.firstName} ${patient.lastName}`.trim();
  const location = [patient.city, patient.postalCode].filter(Boolean).join(' — ');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        // TODO: navigation vers détail patient
      }}
    >
      <View style={styles.cardIconWrap}>
        <MaterialCommunityIcons
          name="account"
          size={28}
          color={colors.primary}
        />
      </View>
      <View style={styles.cardContent}>
        <Text variant="titleMedium" style={styles.cardName} numberOfLines={1}>
          {fullName || 'Sans nom'}
        </Text>
        {location ? (
          <Text variant="bodySmall" style={styles.cardLocation} numberOfLines={1}>
            {location}
          </Text>
        ) : null}
        {patient.birthDate ? (
          <Text variant="bodySmall" style={styles.cardBirth}>
            Né(e) le {formatBirthDate(patient.birthDate)}
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function PatientsScreen() {
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = useCallback(async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      setPatients([]);
      setLoading(false);
      return;
    }
    try {
      const list = await api.getPatients(token);
      setPatients(list ?? []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPatients();
    }, [loadPatients])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPatients();
  }, [loadPatients]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Patients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/patient-add')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          <Text variant="labelLarge" style={styles.addButtonLabel}>
            Ajouter
          </Text>
        </TouchableOpacity>
      </View>

      {loading && patients.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Chargement…
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {patients.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text variant="bodyLarge" style={styles.emptyTitle}>
                Aucun patient
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Ajoutez un patient avec le bouton ci‑dessus.
              </Text>
            </View>
          ) : (
            patients.map((p) => <PatientCard key={p.id} patient={p} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonLabel: {
    color: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    color: colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    color: colors.textMuted,
  },
  emptySubtitle: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontWeight: '600',
    color: colors.text,
  },
  cardLocation: {
    marginTop: 2,
    color: colors.textMuted,
  },
  cardBirth: {
    marginTop: 2,
    color: colors.textMuted,
  },
});
