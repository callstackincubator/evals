import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type {
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function ListScreen() {
  const navigation = useNavigation()

  const handleOpenItem = (itemId: string) => {
    navigation.navigate('Details', { itemId })
  }

  return (
    <View style={styles.list}>
      <Button title="Open item 1" onPress={() => handleOpenItem('1')} />
      <Button title="Open item 2" onPress={() => handleOpenItem('2')} />
    </View>
  )
}

type DetailsProps = StaticScreenProps<{ itemId: string }>

function DetailsScreen({ route }: DetailsProps) {
  const navigation = useNavigation()

  const handleOpenItem = (itemId: string) => {
    if (route.params.itemId === itemId) {
      return
    }
    navigation.navigate('Details', { itemId })
  }

  return (
    <View style={styles.list}>
      <Text>Details for item {route.params.itemId}</Text>
      <Button
        title="Try opening same item"
        onPress={() => handleOpenItem(route.params.itemId)}
      />
      <Button
        title="Open different item 3"
        onPress={() => handleOpenItem('3')}
      />
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    List: ListScreen,
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
  list: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
