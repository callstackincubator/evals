import { useCallback, useState } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function InboxScreen({ navigation }: { navigation: any }) {
  const [refreshCount, setRefreshCount] = useState(0)

  useFocusEffect(
    useCallback(() => {
      setRefreshCount((count) => count + 1)

      return () => {
        // Reserved for any cleanup tied to focus refresh.
      }
    }, []),
  )

  return (
    <View style={styles.container}>
      <Text>Inbox refreshes on focus: {refreshCount}</Text>
      <Button title='Go to details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Back to inbox' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Inbox' component={InboxScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
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
})
