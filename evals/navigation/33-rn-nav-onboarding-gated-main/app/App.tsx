import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['completed: false']

async function completeOnboardingAction() {
  // No-op
  return 'pending'
}

function OnboardingScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.copy}>
        Onboarding and main routes are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => completeOnboardingAction()}
      />
    </View>
  )
}

function MainHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MainHome</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Onboarding: OnboardingScreen,
    MainHome: MainHomeScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  copy: {
    color: '#6b7280',
    textAlign: 'center',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
