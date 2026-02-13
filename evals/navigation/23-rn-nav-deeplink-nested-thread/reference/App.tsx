import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

const RootStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const MessagesStack = createNativeStackNavigator()

type RootParamList = {
  RootTabs: undefined
}

const linking: LinkingOptions<RootParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      RootTabs: {
        screens: {
          HomeTab: {
            screens: {
              Home: '',
              MessagesFlow: {
                screens: {
                  Messages: 'messages',
                  Thread: 'messages/thread/:id',
                },
              },
            },
          },
        },
      },
    },
  },
}

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home</Text>
    </View>
  )
}

function MessagesScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Messages</Text>
    </View>
  )
}

function ThreadScreen({ route }: { route: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Thread ID: {route.params?.id}</Text>
    </View>
  )
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name='Messages' component={MessagesScreen} />
      <MessagesStack.Screen name='Thread' component={ThreadScreen} />
    </MessagesStack.Navigator>
  )
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name='Home' component={HomeScreen} />
      <HomeStack.Screen name='MessagesFlow' component={MessagesNavigator} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  )
}

function RootTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='HomeTab' component={HomeStackNavigator} options={{ headerShown: false, title: 'Home' }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator>
        <RootStack.Screen name='RootTabs' component={RootTabs} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
