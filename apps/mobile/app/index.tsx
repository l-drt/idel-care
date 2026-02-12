import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: vérifier auth et rediriger vers (tabs) ou (auth)/login
  return <Redirect href="/(auth)/login" />;
}
