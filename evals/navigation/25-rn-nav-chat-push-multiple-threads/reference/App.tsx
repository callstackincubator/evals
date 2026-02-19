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

  return (
    <View style={styles.container}>
      <Button
        title="Open thread a1"
        onPress={() => navigation.navigate('Thread', { threadId: 'a1' })}
      />
      <Button
        title="Open thread b2"
        onPress={() => navigation.navigate('Thread', { threadId: 'b2' })}
      />
    </View>
  )
}

type ThreadScreenProps = StaticScreenProps<{ threadId: string }>

function ThreadScreen({ route }: ThreadScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>()
  const threadId = route.params.threadId

  return (
    <View style={styles.container}>
      <Text>Thread: {threadId}</Text>
      <Button
        title="Push follow-up thread"
        onPress={() =>
          navigation.push('Thread', { threadId: `${threadId}-next` })
        }
      />
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
