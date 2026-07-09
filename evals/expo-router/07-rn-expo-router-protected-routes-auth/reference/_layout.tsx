import { Stack } from 'expo-router'

const signedIn = false

export default function Layout() {
  return (
    <Stack>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="account" options={{ title: 'Account' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      </Stack.Protected>
    </Stack>
  )
}
