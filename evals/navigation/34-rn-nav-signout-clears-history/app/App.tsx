import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['signed-in']

async function signOutAndResetAction() {
  // No-op
  return 'pending'
}

function SignInScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SignIn</Text>
      <Text style={styles.copy}>
        Public and private routes are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => signOutAndResetAction()}
      />
    </View>
  )
}

function PrivateHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>PrivateHome</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

function AccountDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>AccountDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    SignIn: SignInScreen,
    PrivateHome: PrivateHomeScreen,
    AccountDetails: AccountDetailsScreen,
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
