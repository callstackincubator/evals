import React, { useLayoutEffect } from 'react'
import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const PEOPLE = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
] as const

function HomeScreen() {
  const navigation = useNavigation()

  const openAlice = () => {
    navigation.navigate('Details', { name: PEOPLE[0].name })
  }
  const openBob = () => {
    navigation.navigate('Details', { name: PEOPLE[1].name })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>People</Text>
      <Text>{`Items: ${PEOPLE.map((person) => person.name).join(', ')}`}</Text>
      <Button title='Open Alice' onPress={openAlice} />
      <Button title='Open Bob' onPress={openBob} />
    </View>
  )
}

type DetailsScreenProps = StaticScreenProps<{
  name: string
}>

function DetailsScreen({ route }: DetailsScreenProps) {
  const navigation = useNavigation()
  const name = route.params?.name ?? 'Unknown'

  useLayoutEffect(() => {
    navigation.setOptions({ title: name })
  }, [navigation, name])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details for {name}</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  id: 'root',
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

type RootStackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
