import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function ThreadsHome({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Open thread a1' onPress={() => navigation.push('Thread', { threadId: 'a1' })} />
      <Button title='Open thread b2' onPress={() => navigation.push('Thread', { threadId: 'b2' })} />
    </View>
  )
}

function ThreadScreen({ navigation, route }: { navigation: any; route: any }) {
  const threadId = route.params?.threadId ?? 'unknown'

  return (
    <View style={styles.container}>
      <Text>Thread: {threadId}</Text>
      <Button
        title='Push follow-up thread'
        onPress={() => navigation.push('Thread', { threadId: `${threadId}-next` })}
      />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='ThreadsHome' component={ThreadsHome} />
        <Stack.Screen name='Thread' component={ThreadScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
