import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StyleSheet, Text, View } from 'react-native'

function LoginScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Auth shell starter</Text>
    </View>
  )
}

function AppHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>App Home</Text>
      <Text style={styles.subtitle}>Implement auth transition behavior.</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Login: LoginScreen,
    AppHome: AppHomeScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
