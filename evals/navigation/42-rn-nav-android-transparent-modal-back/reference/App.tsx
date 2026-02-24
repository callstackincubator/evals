import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenModal = () => {
    navigation.navigate('TransparentModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Open transparent modal" onPress={handleOpenModal} />
    </View>
  )
}

function TransparentModalScreen() {
  const navigation = useNavigation()

  const handleDismiss = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text>Transparent modal content</Text>
        <Button title="Dismiss" onPress={handleDismiss} />
      </View>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    TransparentModal: {
      screen: TransparentModalScreen,
      options: { presentation: 'transparentModal', headerShown: false },
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 240,
    gap: 10,
  },
})
