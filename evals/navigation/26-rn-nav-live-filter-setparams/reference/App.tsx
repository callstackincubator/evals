import { useLayoutEffect } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type FeedFilter = 'all' | 'following' | 'mentions'
const Stack = createNativeStackNavigator()

function FeedScreen({ navigation, route }: { navigation: any; route: any }) {
  const filter: FeedFilter = route.params?.filter ?? 'all'

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title='Toggle filter'
          onPress={() => {
            const nextFilter: FeedFilter = filter === 'all' ? 'following' : 'all'
            navigation.setParams({ filter: nextFilter })
          }}
        />
      ),
    })
  }, [filter, navigation])

  return (
    <View style={styles.container}>
      <Text>Current feed filter: {filter}</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Feed' component={FeedScreen} initialParams={{ filter: 'all' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
