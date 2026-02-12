import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function Setup2FAScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Configuration 2FA</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        À implémenter
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
