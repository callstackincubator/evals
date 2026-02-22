import { useCallback, useState } from 'react'

import {
  createStaticNavigation,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function FeedScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      setStatus('loading')

      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          setStatus('loaded')
        }
      }, 1000)

      return () => {
        controller.abort()
        clearTimeout(timeoutId)
      }
    }, [])
  )

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  return (
    <View style={styles.feed}>
      <Text>Fetch status: {status}</Text>
      <Button title="Open details" onPress={handleOpenDetails} />
    </View>
  )
}

function DetailsScreen() {
  const navigation = useNavigation()

  const handleGoBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.centered}>
      <Button title="Back to feed" onPress={handleGoBack} />
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Feed: FeedScreen,
    Details: DetailsScreen,
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
