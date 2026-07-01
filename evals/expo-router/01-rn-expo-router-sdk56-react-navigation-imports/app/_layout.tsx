import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </Stack.Navigator>
    </ThemeProvider>
  )
}
