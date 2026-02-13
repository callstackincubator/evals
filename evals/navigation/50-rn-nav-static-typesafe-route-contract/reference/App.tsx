import { createStaticNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Details: { itemId: string }
}

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>
type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>

function HomeScreen({ navigation }: HomeProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Open item 123' onPress={() => navigation.navigate('Details', { itemId: '123' })} />
    </View>
  )
}

function DetailsScreen({ route }: DetailsProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Typed itemId: {route.params.itemId}</Text>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation />
}
