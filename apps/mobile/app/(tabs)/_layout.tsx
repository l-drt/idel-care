import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  hasHardwareAsync,
  isEnrolledAsync,
} from '@/utils/safe-local-auth';
import { useAuthStore } from '@/stores/authStore';

export default function TabsLayout() {
  const { shouldOfferBiometric, setBiometricEnabled, declineBiometricOffer } = useAuthStore();

  useEffect(() => {
    if (!shouldOfferBiometric) return;

    let cancelled = false;

    const offer = async () => {
      const hasHardware = await hasHardwareAsync();
      const isEnrolled = await isEnrolledAsync();
      if (cancelled || !hasHardware || !isEnrolled) {
        declineBiometricOffer();
        return;
      }

      Alert.alert(
        'Déverrouillage biométrique',
        "Voulez-vous utiliser Face ID ou Touch ID pour déverrouiller l'app à l'ouverture ?",
        [
          { text: 'Plus tard', onPress: () => declineBiometricOffer(), style: 'cancel' },
          { text: 'Activer', onPress: () => setBiometricEnabled(true) },
        ],
      );
    };

    offer();
    return () => {
      cancelled = true;
    };
  }, [shouldOfferBiometric, setBiometricEnabled, declineBiometricOffer]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1976d2',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: 'Tournées',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
