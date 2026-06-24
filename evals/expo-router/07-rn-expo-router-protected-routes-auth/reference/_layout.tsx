import { Stack } from 'expo-router'

const signedIn = false

export default function Layout() {
  return (
    <Stack>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="account" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  )
}
