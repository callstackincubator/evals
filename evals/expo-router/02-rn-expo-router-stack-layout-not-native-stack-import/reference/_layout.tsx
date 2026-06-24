import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="details" options={{ presentation: 'card', title: 'Details' }} />
    </Stack>
  )
}
