import { useEffect } from 'react'

import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator({
  screens: {
    Feed: {
      screen: FeedScreen,
      initialParams: { filter: 'all' },
      options: { title: 'Feed' },
    },
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

type FeedFilter = 'all' | 'following'
type FeedScreenProps = StaticScreenProps<{ filter: FeedFilter }>

function FeedScreen({ route }: FeedScreenProps) {
  const navigation = useNavigation()
  const filter = route.params.filter

  useEffect(() => {
    const onTogglePress = () => {
      const nextFilter: FeedFilter = filter === 'all' ? 'following' : 'all'
      navigation.setParams({ filter: nextFilter })
    }

    navigation.setOptions({
      headerRight: () => (
        <Button title="Toggle filter" onPress={onTogglePress} />
      ),
    })
  }, [filter, navigation])

  return (
    <View style={styles.container}>
      <Text>Current feed filter: {filter}</Text>
    </View>
  )
}

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
