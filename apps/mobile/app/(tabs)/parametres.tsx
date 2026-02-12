import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { hasHardwareAsync, isEnrolledAsync } from '@/utils/safe-local-auth';
import { colors } from '@/theme';

const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';

export default function ParametresScreen() {
  const { user, logout, setBiometricEnabled, biometricEnabled } = useAuthStore();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hasHardware, isEnrolled] = await Promise.all([
        hasHardwareAsync(),
        isEnrolledAsync(),
      ]);
      if (!cancelled) setBiometricAvailable(hasHardware && isEnrolled);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY).then((v) => {
      setNotificationsEnabled(v === 'true');
    });
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    await setBiometricEnabled(value);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, value ? 'true' : 'false');
    setNotificationsEnabled(value);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleDonneesCollectees = () => {
    router.push('/donnees-collectees');
  };

  const handleSupprimerCompte = () => {
    router.push('/supprimer-compte');
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          Paramètres
        </Text>

        <List.Section>
          <List.Subheader>Mon compte</List.Subheader>
          {user && (
            <>
              <List.Item
                title={`${user.firstName} ${user.lastName}`}
                description={user.email}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
              <List.Item
                title="Changer le mot de passe"
                description="Modifier votre mot de passe de connexion"
                left={(props) => <List.Icon {...props} icon="lock" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleChangePassword}
              />
            </>
          )}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Sécurité</List.Subheader>
          <List.Item
            title="Double authentification (2FA)"
            description="Activée à la connexion"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
          />
          {biometricAvailable && (
            <List.Item
              title="Déverrouillage Face ID / Touch ID"
              description="Utiliser la biométrie à l'ouverture de l'app"
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  color={colors.primary}
                />
              )}
            />
          )}
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Activer les notifications"
            description="Alertes et rappels (aucune donnée santé dans les notifications)"
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                color={colors.primary}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Vie privée et données (RGPD)</List.Subheader>
          <List.Item
            title="Données collectées"
            description="Voir les données traitées et les exporter (portabilité)"
            left={(props) => <List.Icon {...props} icon="database" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleDonneesCollectees}
          />
          <List.Item
            title="Supprimer mon compte"
            description="Droit à l’oubli : anonymisation et fermeture du compte"
            left={(props) => <List.Icon {...props} icon="account-remove" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleSupprimerCompte}
            titleStyle={{ color: colors.error }}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>À propos</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </List.Section>

        <View style={styles.logout}>
          <Button variant="secondary" onPress={handleLogout}>
            Se déconnecter
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  title: { fontWeight: '700', color: colors.primary, margin: 16, marginBottom: 8 },
  logout: { marginHorizontal: 16, marginTop: 24 },
});
