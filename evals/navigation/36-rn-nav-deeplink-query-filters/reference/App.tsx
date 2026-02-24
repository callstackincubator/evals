import {
  createStaticNavigation,
  LinkingOptions,
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StyleSheet, Text, View } from 'react-native'

type FeedParamList = {
  sort?: string
  order?: string
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
}

function FeedScreen({ route }: StaticScreenProps<FeedParamList>) {
  const sort =
    route.params?.sort === 'date' || route.params?.sort === 'likes'
      ? route.params.sort
      : 'date'
  const order =
    route.params?.order === 'asc' || route.params?.order === 'desc'
      ? route.params.order
      : 'desc'

  return (
    <View style={styles.container}>
      <Text>Feed</Text>
      <Text>sort: {sort}</Text>
      <Text>order: {order}</Text>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Feed: {
      screen: FeedScreen,
      linking: {
        path: 'feed',
        parse: {
          sort: (value: string) => value,
          order: (value: string) => value,
        },
      },
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

export default function App() {
  return <Navigation linking={linking} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})
