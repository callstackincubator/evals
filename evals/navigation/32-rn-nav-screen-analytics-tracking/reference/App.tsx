import { useCallback, useRef } from 'react'

import {
  createStaticNavigation,
  useNavigationContainerRef,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Details: undefined
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>

function HomeScreen({ navigation }: HomeScreenProps) {
  const handleGoToDetails = useCallback(() => {
    navigation.navigate('Details')
  }, [navigation])

  return (
    <View style={styles.centered}>
      <Button title="Open" onPress={handleGoToDetails} />
    </View>
  )
}

type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>

function DetailsScreen({ navigation }: DetailsScreenProps) {
  const handleGoBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <View style={styles.detailsContainer}>
      <Text>Details</Text>
      <Button title="Go back" onPress={handleGoBack} />
    </View>
  )
}

const rootStackConfig = {
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
}

const RootStack =
  createNativeStackNavigator<RootStackParamList>(rootStackConfig)

const Navigation = createStaticNavigation({
  ...RootStack,
  config: rootStackConfig,
})

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const analytics = {
  trackScreenView(routeName: string) {
    console.log('screen_view', routeName)
  },
}

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const previousRouteNameRef = useRef<string>()

  const trackCurrentRoute = useCallback(() => {
    const currentRouteName = navigationRef.getCurrentRoute()?.name

    if (
      !currentRouteName ||
      previousRouteNameRef.current === currentRouteName
    ) {
      return
    }

    analytics.trackScreenView(currentRouteName)
    previousRouteNameRef.current = currentRouteName
  }, [navigationRef])

  return (
    <Navigation
      ref={navigationRef}
      onReady={trackCurrentRoute}
      onStateChange={trackCurrentRoute}
    />
  )
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  detailsContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
})
