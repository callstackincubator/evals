import { useLayoutEffect, useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { enableFreeze } from 'react-native-screens'

enableFreeze(true)

function HomeScreen() {
  const navigation = useNavigation()
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount((value) => value + 1)
  }

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title={`+ ${count}`} onPress={handleIncrement} />
      ),
    })
  }, [count, navigation])

  return (
    <View style={styles.home}>
      <Text>Header counter: {count}</Text>
      <Button title="Open details" onPress={handleOpenDetails} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text>Details</Text>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screenOptions: { freezeOnBlur: true },
  screens: {
    Home: HomeScreen,
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
  home: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})
