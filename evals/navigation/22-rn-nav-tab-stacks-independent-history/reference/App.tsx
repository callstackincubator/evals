import { createStaticNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'

function FeedHome() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Feed root</Text>
      <Button
        title="Open feed details"
        onPress={() =>
          navigate('FeedTab', {
            screen: 'FeedDetails',
          })
        }
      />
    </View>
  )
}

function FeedDetails() {
  return (
    <View style={styles.container}>
      <Text>Feed details</Text>
    </View>
  )
}

function SettingsHome() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Settings root</Text>
      <Button
        title="Open profile settings"
        onPress={() =>
          navigate('SettingsTab', {
            screen: 'ProfileSettings',
          })
        }
      />
    </View>
  )
}

function ProfileSettings() {
  return (
    <View style={styles.container}>
      <Text>Profile settings</Text>
    </View>
  )
}

export default function App() {
  return <Navigation />
}

const FeedNavigator = createNativeStackNavigator({
  screens: {
    FeedHome,
    FeedDetails,
  },
})

const SettingsNavigator = createNativeStackNavigator({
  screens: {
    SettingsHome,
    ProfileSettings,
  },
})

const RootStack = createBottomTabNavigator({
  screens: {
    FeedTab: {
      screen: FeedNavigator,
      options: {
        headerShown: false,
      },
    },
    SettingsTab: {
      screen: SettingsNavigator,
      options: {
        headerShown: false,
      },
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
