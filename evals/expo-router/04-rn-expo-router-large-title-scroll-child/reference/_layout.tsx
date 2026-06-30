import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
    </Stack>
  )
}
