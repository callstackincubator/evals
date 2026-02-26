import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type {
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenDetails = () => {
    navigation.navigate('Details', { itemId: '123' })
  }

  return (
    <View style={styles.container}>
      <Button title="Open" onPress={handleOpenDetails} />
    </View>
  )
}

type DetailsProps = StaticScreenProps<{ itemId: string }>

function DetailsScreen({ route }: DetailsProps) {
  return (
    <View style={styles.container}>
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
