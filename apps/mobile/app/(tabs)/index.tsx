import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <Text variant="headlineMedium">Accueil</Text>
      {user && (
        <Text variant="bodyLarge" style={styles.user}>
          {user.firstName} {user.lastName}
        </Text>
      )}
      <Text variant="bodyMedium" style={styles.subtitle}>
        IDEL Care — Tableau de bord à implémenter
      </Text>
      <Button variant="text" onPress={handleLogout} style={styles.logout}>
        Déconnexion
      </Button>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  user: { marginTop: 8, color: colors.textMuted },
  subtitle: { marginTop: 10, color: colors.textMuted },
  logout: { marginTop: 24 },
});
