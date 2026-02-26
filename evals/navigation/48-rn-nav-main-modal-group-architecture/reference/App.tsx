import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  const handleOpenCompose = () => {
    navigation.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Open" onPress={handleOpenDetails} />
      <Button title="Open compose modal" onPress={handleOpenCompose} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text>Main details route</Text>
    </View>
  )
}

function ComposeModalScreen() {
  const navigation = useNavigation()

  const handleDismiss = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.modal}>
      <Text>Modal compose route</Text>
      <Button title="Dismiss" onPress={handleDismiss} />
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  groups: {
    Main: {
      screens: {
        Home: HomeScreen,
        Details: DetailsScreen,
      },
    },
    Modal: {
      screenOptions: { presentation: 'modal' },
      screens: {
        ComposeModal: ComposeModalScreen,
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
  return <Navigation />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
