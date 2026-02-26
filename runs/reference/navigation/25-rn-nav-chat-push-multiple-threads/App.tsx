import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  const navigateToThread = (threadId: string) =>
    navigation.navigate('Thread', { threadId })

  return (
    <View style={styles.container}>
      <Button title="Open" onPress={() => navigateToThread('a1')} />
      <Button title="Open thread b2" onPress={() => navigateToThread('b2')} />
    </View>
  )
}

type ThreadScreenProps = StaticScreenProps<{ threadId: string }>

function ThreadScreen({ route }: ThreadScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>()
  const threadId = route.params.threadId

  const pushThread = () =>
    navigation.push('Thread', { threadId: `${threadId}-next` })

  return (
    <View style={styles.container}>
      <Text>Thread: {threadId}</Text>
      <Button title="Push follow-up thread" onPress={pushThread} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Thread: ThreadScreen,
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
