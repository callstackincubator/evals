import { useCallback, useState } from 'react'

import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>()

  const pushScreen = (id: string) => navigation.push('Details', { id })

  return (
    <View style={styles.screen}>
      <Button title="Push details A" onPress={() => pushScreen('A')} />
      <Button title="Push details B" onPress={() => pushScreen('B')} />
    </View>
  )
}

type DetailsScreenProps = StaticScreenProps<{ id: string }>

function DetailsScreen({ route }: DetailsScreenProps) {
  const [status, setStatus] = useState('idle')
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>()

  const pushNextScreen = () =>
    navigation.push('Details', { id: `${route.params?.id}-next` })

  useFocusEffect(
    useCallback(() => {
      setStatus('loading')

      const timeoutId = setTimeout(() => {
        setStatus(`loaded ${route.params?.id}`)
      }, 800)

      return () => {
        clearTimeout(timeoutId)
      }
    }, [route.params?.id])
  )

  return (
    <View style={styles.screen}>
      <Text>Details {route.params?.id}</Text>
      <Text>Status: {status}</Text>
      <Button title="Push next" onPress={pushNextScreen} />
      <Button title="Pop" onPress={() => navigation.goBack()} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
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
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
