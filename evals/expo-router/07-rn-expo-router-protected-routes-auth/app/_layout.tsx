import { Stack } from 'expo-router'

const signedIn = false

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="account" options={{ title: 'Account' }} />
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
    </Stack>
  )
}
