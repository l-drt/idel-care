import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components';
import { api } from '@/services/api';
import { colors } from '@/theme';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const SECTIONS = [
  {
    title: 'Identité et contact',
    items: [
      'Nom, prénom',
      'Adresse e-mail',
      'Numéro de téléphone (optionnel)',
      'Rôle professionnel (infirmier, etc.)',
    ],
  },
  {
    title: 'Connexion et sécurité',
    items: [
      'Mot de passe (stocké de manière sécurisée, jamais en clair)',
      'Méthode de double authentification (2FA) : TOTP, SMS ou e-mail',
      'Historique de connexion (date, heure) pour la sécurité du compte',
    ],
  },
  {
    title: 'Activité professionnelle',
    items: [
      'Patients qui vous sont assignés (identité, coordonnées, consentement)',
      'Activit\u00e9s de soins planifi\u00e9es et r\u00e9alis\u00e9es',
      'Constantes et signes vitaux enregistr\u00e9s',
      'Tourn\u00e9es (dates, distances)',
    ],
  },
  {
    title: 'Traçabilité (conformité HDS)',
    items: [
      'Logs d’accès et d’actions (qui, quoi, quand) pour la sécurité des données de santé',
    ],
  },
];

export default function DonneesCollecteesScreen() {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    let token = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);

    const tryRefresh = async (): Promise<string | null> => {
      if (!refreshToken) return null;
      try {
        const data = await api.refresh(refreshToken);
        await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
        return data.accessToken;
      } catch {
        return null;
      }
    };

    if (!token && refreshToken) {
      token = await tryRefresh();
    }
    if (!token) {
      Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
      router.replace('/(auth)/login');
      return;
    }

    setExportLoading(true);
    try {
      let data = await api.exportMyData(token);
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        message: json,
        title: 'Export IDEL Care - Mes données (RGPD)',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible d'exporter les données.";
      const isAuthError = msg.toLowerCase().includes('unauthorized') || msg.includes('401') || msg.includes('Session');

      if (isAuthError) {
        const newToken = await tryRefresh();
        if (newToken) {
          try {
            const data = await api.exportMyData(newToken);
            const json = JSON.stringify(data, null, 2);
            await Share.share({
              message: json,
              title: 'Export IDEL Care - Mes données (RGPD)',
            });
          } catch (retryErr) {
            Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
              { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
          }
        } else {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') },
          ]);
        }
      } else if (msg.toLowerCase().includes('throttl') || msg.includes('429') || msg.includes('trop de requêtes')) {
        Alert.alert('Limite atteinte', 'Réessayez dans quelques minutes.');
      } else {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.title}>
          Données collectées
        </Text>
        <Text variant="bodyMedium" style={styles.intro}>
          Conformément au RGPD (articles 13 et 14), voici les catégories de données que nous traitons pour votre compte et l’usage du service IDEL Care.
        </Text>
        <Button
          variant="primary"
          onPress={handleExport}
          loading={exportLoading}
          disabled={exportLoading}
          style={styles.exportBtn}
          icon="export"
        >
          Exporter mes données
        </Button>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              {section.title}
            </Text>
            {section.items.map((item) => (
              <Text key={item} variant="bodyMedium" style={styles.item}>
                • {item}
              </Text>
            ))}
          </View>
        ))}
        <Text variant="bodySmall" style={styles.footer}>
          Vous pouvez supprimer votre compte depuis Paramètres → Supprimer mon compte (droit à l’oubli).
        </Text>
        <Button variant="text" onPress={() => router.back()} style={styles.back}>
          Retour aux paramètres
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingBottom: 32 },
  title: { fontWeight: '700', color: colors.primary, marginBottom: 12 },
  intro: { color: colors.textMuted, marginBottom: 16 },
  exportBtn: { marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: '600', color: colors.primary, marginBottom: 8 },
  item: { color: colors.textMuted, marginLeft: 8, marginBottom: 4 },
  footer: { color: colors.textMuted, marginTop: 16, fontStyle: 'italic' },
  back: { marginTop: 24 },
});
