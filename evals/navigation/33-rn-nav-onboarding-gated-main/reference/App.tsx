import { createContext, useContext, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList } from '@react-navigation/core'

function WelcomeScreen() {
  const { complete: completeOnboarding } = useOnboardingContext()
  return (
    <View style={styles.welcomeScreenContainer}>
      <Text>Onboarding step</Text>
      <Button title="Finish onboarding" onPress={completeOnboarding} />
    </View>
  )
}

function MainHomeScreen() {
  return (
    <View style={styles.homeScreenContainer}>
      <Text>Main app home</Text>
    </View>
  )
}

const OnboardingContext = createContext({
  completed: false,
  complete: () => {},
})

function useOnboardingContext() {
  const context = useContext(OnboardingContext)

  if (!context) {
    throw new Error('OnboardingContext is not attached to any provider')
  }

  return context
}

function useIsOnboarded() {
  return useOnboardingContext().completed
}

function useIsNotOnboarded() {
  return !useIsOnboarded()
}

// Gate the main app behind onboarding completion. Show onboarding routes first, then switch to the main route graph when onboarding is complete.
export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  const contextValue = {
    completed: onboardingComplete,
    complete: () => setOnboardingComplete(true),
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      <Navigation />
    </OnboardingContext.Provider>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: MainHomeScreen,
      if: useIsOnboarded,
    },
    Onboarding: {
      screen: WelcomeScreen,
      if: useIsNotOnboarded,
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

const styles = StyleSheet.create({
  homeScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
