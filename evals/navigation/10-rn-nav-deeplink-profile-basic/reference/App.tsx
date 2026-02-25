import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  function handleOpenProfile() {
    navigation.navigate('Profile', { userId: '123' })
  }

  return (
    <View style={styles.container}>
      <Button title="Open" onPress={handleOpenProfile} />
    </View>
  )
}

type ProfileProps = StaticScreenProps<{ userId: string }>

function ProfileScreen({ route }: ProfileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>userId: {route.params.userId}</Text>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Profile: {
      screen: ProfileScreen,
      linking: 'profile/:userId',
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

const linking = {
  prefixes: ['myapp://'],
}

export default function App() {
  return <Navigation linking={linking} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})
