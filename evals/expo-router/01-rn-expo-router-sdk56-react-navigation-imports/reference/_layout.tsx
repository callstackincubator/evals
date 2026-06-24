import { Stack, useNavigation } from 'expo-router'

export default function Layout() {
  useNavigation()
  return <Stack screenOptions={{ headerShown: true }} />
}
