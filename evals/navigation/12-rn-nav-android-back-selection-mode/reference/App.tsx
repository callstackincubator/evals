import { useCallback, useState } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BackHandler, Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  SelectableList: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Open list' onPress={() => navigation.navigate('SelectableList')} />
    </View>
  )
}

function SelectableListScreen() {
  const [selectionMode, setSelectionMode] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (selectionMode) {
          setSelectionMode(false)
          return true
        }

        return false
      })

      return () => {
        subscription.remove()
      }
    }, [selectionMode]),
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectionMode ? 'Selection mode ON' : 'Selection mode OFF'}</Text>
      <Button
        title={selectionMode ? 'Disable selection mode' : 'Enable selection mode'}
        onPress={() => setSelectionMode((value) => !value)}
      />
      <Text>Press Android back to exit selection mode before leaving screen.</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='SelectableList' component={SelectableListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
