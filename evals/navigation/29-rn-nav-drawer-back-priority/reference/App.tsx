import { createStaticNavigation } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'

function HomeScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Home screen</Text>
      <Button
        title="Open details"
        onPress={() => navigate('Main', { screen: 'Details' })}
      />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.container}>
      <Text>Details screen</Text>
    </View>
  )
}

const MainStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        headerShown: false,
      },
    },
    Details: {
      screen: DetailsScreen,
      options: {
        headerShown: false,
      },
    },
  },
})

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text>Help</Text>
    </View>
  )
}

export default function App() {
  return <Navigation />
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createDrawerNavigator({
  screens: {
    Main: {
      screen: MainStack,
    },
    Help: HelpScreen,
  },
})

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
