import { Stack } from 'expo-router'
import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation'

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </Stack>
    </ThemeProvider>
  )
}
