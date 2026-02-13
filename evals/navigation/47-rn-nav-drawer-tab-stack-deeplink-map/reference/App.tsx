import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

const RootStack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()
const ItemStack = createNativeStackNavigator()

type RootParamList = {
  AppDrawer: undefined
  NotFound: undefined
}

const linking: LinkingOptions<RootParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      AppDrawer: {
        screens: {
          MainTabs: {
            screens: {
              HomeTab: {
                screens: {
                  Home: '',
                  Details: 'item/:id',
                },
              },
              SettingsTab: 'settings',
            },
          },
        },
      },
      NotFound: '*',
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

function DetailsScreen({ route }: { route: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Deep route item: {route.params?.id}</Text>
    </View>
  )
}

function HomeStackNavigator() {
  return (
    <ItemStack.Navigator>
      <ItemStack.Screen name='Home' component={HomeScreen} />
      <ItemStack.Screen name='Details' component={DetailsScreen} />
    </ItemStack.Navigator>
  )
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings</Text>
    </View>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='HomeTab' component={HomeStackNavigator} options={{ headerShown: false, title: 'Home' }} />
      <Tab.Screen name='SettingsTab' component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  )
}

function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Unknown link fallback</Text>
    </View>
  )
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name='MainTabs' component={MainTabs} options={{ headerShown: false }} />
    </Drawer.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator>
        <RootStack.Screen name='AppDrawer' component={DrawerNavigator} options={{ headerShown: false }} />
        <RootStack.Screen name='NotFound' component={NotFoundScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
