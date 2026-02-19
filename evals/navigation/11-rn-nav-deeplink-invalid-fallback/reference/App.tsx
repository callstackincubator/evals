import {
  createStaticNavigation,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Profile: { userId?: string }
}

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>
type ProfileProps = StaticScreenProps<RootStackParamList['Profile']>

function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>()

  function handleOpenValidProfile() {
    navigation.navigate('Profile', { userId: '42' })
  }

  function handleOpenInvalidProfile() {
    navigation.navigate('Profile', { userId: 'x' })
  }

  return (
    <View style={styles.container}>
      <Button title="Valid profile 42" onPress={handleOpenValidProfile} />
      <Button title="Invalid profile x" onPress={handleOpenInvalidProfile} />
    </View>
  )
}

function ProfileScreen({ route }: ProfileProps) {
  const normalizedId = route.params.userId ?? ''
  const isValid = /^\d+$/.test(normalizedId)

  return (
    <View style={styles.container}>
      {isValid ? (
        <Text>Profile userId: {normalizedId}</Text>
      ) : (
        <Text>Invalid profile link</Text>
      )}
    </View>
  )
}

const RootStack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Home: HomeScreen,
    Profile: {
      screen: ProfileScreen,
      linking: {
        path: 'profile/:userId',
        parse: {
          userId: (value: string) => value.trim(),
        },
      },
    },
  },
})

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
})
