import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">IDEL Care</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Écran de connexion — à implémenter
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
    backgroundColor: '#fff',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});
