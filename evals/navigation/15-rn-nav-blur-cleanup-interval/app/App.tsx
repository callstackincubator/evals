import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function startPolling() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function HomeScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Navigation baseline scaffold</Text>
      <Button title='Call placeholder' onPress={() => startPolling()} />
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.subtitle}>Implement requirement behavior from this shell.</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
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
