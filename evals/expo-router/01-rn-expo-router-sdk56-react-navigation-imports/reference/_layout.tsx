import { DefaultTheme, Stack, ThemeProvider } from 'expo-router'

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </Stack>
    </ThemeProvider>
  )
}
