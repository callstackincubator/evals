import { useLayoutEffect, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function DetailsScreen({ navigation }: { navigation: any }) {
  const [bookmarked, setBookmarked] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title={bookmarked ? 'Unbookmark' : 'Bookmark'}
          onPress={() => setBookmarked((value) => !value)}
        />
      ),
    })
  }, [bookmarked, navigation])

  return (
    <View style={styles.container}>
      <Text>{bookmarked ? 'Bookmarked' : 'Not bookmarked'}</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
