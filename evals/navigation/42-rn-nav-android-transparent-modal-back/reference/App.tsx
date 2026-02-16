import { useCallback } from 'react'

import {
  NavigationContainer,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BackHandler, Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

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

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.goBack()
          return true
        }
      )

      return () => subscription.remove()
    }, [navigation])
  )

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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="TransparentModal"
          component={TransparentModalScreen}
          options={{ presentation: 'transparentModal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
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
