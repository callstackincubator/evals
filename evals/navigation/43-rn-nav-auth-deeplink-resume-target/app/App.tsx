import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['target: item-7']

async function captureDeferredTarget() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function LandingScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Landing</Text>
      <Text style={styles.copy}>
        Public/private route shells are ready for deferred-target behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => captureDeferredTarget()}
      />
    </View>
  )
}

function SignInScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SignIn</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

function ProtectedDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ProtectedDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Landing: LandingScreen,
    SignIn: SignInScreen,
    ProtectedDetails: ProtectedDetailsScreen,
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
