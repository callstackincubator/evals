import { Stack, useNavigation } from 'expo-router'

export default function Layout() {
  useNavigation()
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
  )
}
