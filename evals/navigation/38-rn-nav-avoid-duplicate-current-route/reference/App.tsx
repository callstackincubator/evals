import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function ListScreen({ navigation }: { navigation: any }) {
  const openDetails = (itemId: string) => {
    const currentRoute = navigation.getState().routes[navigation.getState().index]
    const currentItemId = currentRoute?.name === 'Details' ? currentRoute.params?.itemId : undefined

    if (currentItemId === itemId) {
      return
    }

    navigation.navigate('Details', { itemId })
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Button title='Open item 1' onPress={() => openDetails('1')} />
      <Button title='Open item 2' onPress={() => openDetails('2')} />
    </View>
  )
}

function DetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const openSibling = (itemId: string) => {
    if (route.params?.itemId === itemId) {
      return
    }
    navigation.navigate('Details', { itemId })
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Details for item {route.params?.itemId}</Text>
      <Button title='Try opening same item' onPress={() => openSibling(route.params?.itemId)} />
      <Button title='Open different item 3' onPress={() => openSibling('3')} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='List' component={ListScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
