import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Accueil</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        IDEL Care — Tableau de bord à implémenter
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});
