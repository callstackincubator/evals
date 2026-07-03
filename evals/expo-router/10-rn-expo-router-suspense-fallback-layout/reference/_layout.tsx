import { Stack } from 'expo-router'
import { Text } from 'react-native'

export function SuspenseFallback() {
  return <Text>Loading route...</Text>
}

export default function Layout() {
  return <Stack />
}
