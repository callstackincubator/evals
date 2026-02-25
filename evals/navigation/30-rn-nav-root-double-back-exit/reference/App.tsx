import { useCallback, useRef } from 'react'

import {
  createStaticNavigation,
  useFocusEffect,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  BackHandler,
  Button,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'

const EXIT_WINDOW_MS = 2000
const LONG_TOAST_ANDROID_MS = 3500

type DoubleBackExitProps = {
  exitWindowMs?: number
  onFirstTry?: () => void
}

function useDoubleBackToExit({
  exitWindowMs = EXIT_WINDOW_MS,
  onFirstTry,
}: DoubleBackExitProps) {
  const lastBackPressRef = useRef(0)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          const now = Date.now()

          if (now - lastBackPressRef.current < exitWindowMs) {
            BackHandler.exitApp()
            return true
          }

          lastBackPressRef.current = now
          onFirstTry?.()
          return true
        }
      )

      return () => subscription.remove()
    }, [exitWindowMs, onFirstTry])
  )
}

function HomeScreen() {
  const { navigate } = useNavigation()
  useDoubleBackToExit({
    exitWindowMs: LONG_TOAST_ANDROID_MS,
    onFirstTry: () =>
      ToastAndroid.show('Press back again to exit', LONG_TOAST_ANDROID_MS),
  })

  return (
    <View style={styles.container}>
      <Text>Root screen</Text>
      <Button title="Open" onPress={() => navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  const { goBack } = useNavigation()
  return (
    <View style={styles.container}>
      <Text>Details</Text>
      <Button title="Back to root" onPress={() => goBack()} />
    </View>
  )
}

export default function App() {
  return <Navigation />
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
