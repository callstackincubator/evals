import { useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/core'

type StepOneParams = {
  firstName: string
}

type StepTwoParams = StepOneParams & {
  email?: string
}

type StepThreeParams = StepTwoParams & {
  city?: string
}

type SummaryParams = StepThreeParams

function StepOneScreen({ route }: StaticScreenProps<StepOneParams>) {
  const { navigate } = useNavigation()
  const [firstName, setFirstName] = useState(route.params?.firstName ?? '')

  return (
    <View style={styles.stepContainer}>
      <Text>Step 1</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        style={styles.text}
      />
      <Button
        title="Open"
        onPress={() => navigate('StepTwoScreen', { firstName })}
      />
    </View>
  )
}

function StepTwoScreen({ route }: StaticScreenProps<StepTwoParams>) {
  const { goBack, navigate } = useNavigation()
  const [email, setEmail] = useState(route.params?.email ?? '')
  const { firstName } = route.params

  return (
    <View style={styles.stepContainer}>
      <Text>Step 2</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.text}
      />
      <Button title="Back" onPress={() => goBack()} />
      <Button
        title="Next"
        onPress={() => navigate('StepThreeScreen', { firstName, email })}
      />
    </View>
  )
}

function StepThreeScreen({ route }: StaticScreenProps<StepThreeParams>) {
  const { navigate, goBack } = useNavigation()
  const { firstName, email, city: initialCityParam } = route.params ?? {}
  const [city, setCity] = useState(initialCityParam ?? '')

  return (
    <View style={styles.stepContainer}>
      <Text>Step 3</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="City"
        style={styles.text}
      />
      <Button title="Back" onPress={() => goBack()} />
      <Button
        title="Summary"
        onPress={() => navigate('SummaryScreen', { firstName, email, city })}
      />
    </View>
  )
}

function SummaryScreen({ route }: StaticScreenProps<SummaryParams>) {
  const { firstName, email, city } = route.params ?? {}

  return (
    <View style={styles.summaryContainer}>
      <Text>Summary</Text>
      <Text>firstName: {firstName ?? ''}</Text>
      <Text>email: {email ?? ''}</Text>
      <Text>city: {city ?? ''}</Text>
    </View>
  )
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createNativeStackNavigator({
  screens: {
    StepOneScreen: {
      screen: StepOneScreen,
    },
    StepTwoScreen: {
      screen: StepTwoScreen,
    },
    StepThreeScreen: {
      screen: StepThreeScreen,
    },
    SummaryScreen: {
      screen: SummaryScreen,
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  summaryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  text: {
    width: '100%',
    borderWidth: 1,
    padding: 8,
  },
})
