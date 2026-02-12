import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Messages</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Messagerie — à implémenter
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
