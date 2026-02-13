import { useLayoutEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function DetailsScreen({ navigation }: { navigation: any }) {
  const [bookmarked, setBookmarked] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title={bookmarked ? 'Unbookmark' : 'Bookmark'} onPress={() => setBookmarked((value) => !value)} />
      ),
    })
  }, [bookmarked, navigation])

  return (
    <View style={styles.container}>
      <Text>{bookmarked ? 'Bookmarked' : 'Not bookmarked'}</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
    padding: 24,
  },
})
