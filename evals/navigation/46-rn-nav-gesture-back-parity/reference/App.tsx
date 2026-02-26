import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  CriticalStep: undefined
}

function HomeScreen() {
  const navigation =
    useNavigation<
      NativeStackScreenProps<RootStackParamList, 'Home'>['navigation']
    >()
  const goToCriticalStep = () => navigation.navigate('CriticalStep')
  return (
    <View style={styles.container}>
      <Button title="Start critical flow" onPress={goToCriticalStep} />
    </View>
  )
}

function CriticalStepScreen() {
  const navigation =
    useNavigation<
      NativeStackScreenProps<RootStackParamList, 'CriticalStep'>['navigation']
    >()
  const goBack = () => navigation.goBack()

  return (
    <View style={styles.container}>
      <Text>Critical step</Text>
      <Button title="Complete and go back" onPress={goBack} />
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
    },
    CriticalStep: {
      screen: CriticalStepScreen,
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
