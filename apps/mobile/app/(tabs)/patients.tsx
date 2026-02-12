import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function PatientsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <Text variant="headlineMedium">Patients</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Liste des patients — à implémenter
      </Text>
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
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});
