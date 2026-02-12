import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="inscription" />
      <Stack.Screen name="choose-2fa" />
      <Stack.Screen name="setup-2fa" />
      <Stack.Screen name="verify-2fa" />
    </Stack>
  );
}
