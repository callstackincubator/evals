import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function FeedScreen() {
  const navigation = useNavigation()

  const handleCompose = () => {
    navigation.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Compose" onPress={handleCompose} />
    </View>
  )
}

function ProfileScreen() {
  const navigation = useNavigation()

  const handleCompose = () => {
    navigation.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Compose" onPress={handleCompose} />
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
      <Text>Compose modal</Text>
      <Button title="Dismiss" onPress={handleDismiss} />
    </View>
  )
}

const HomeTabs = createBottomTabNavigator({
  screens: {
    Feed: FeedScreen,
    Profile: ProfileScreen,
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    MainTabs: {
      screen: HomeTabs,
      options: { headerShown: false },
    },
    ComposeModal: {
      screen: ComposeModalScreen,
      options: { presentation: 'modal', title: 'Compose' },
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
