import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

type RootParamList = {
  Feed: { sort?: string; order?: string }
}

const Stack = createNativeStackNavigator<RootParamList>()

const linking: LinkingOptions<RootParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Feed: {
        path: 'feed',
        parse: {
          sort: (value: string) => value,
          order: (value: string) => value,
        },
      },
    },
  },
}

function FeedScreen({ route }: { route: any }) {
  const sort = route.params?.sort === 'date' || route.params?.sort === 'likes' ? route.params.sort : 'date'
  const order = route.params?.order === 'asc' || route.params?.order === 'desc' ? route.params.order : 'desc'

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text>Feed</Text>
      <Text>sort: {sort}</Text>
      <Text>order: {order}</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name='Feed' component={FeedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
