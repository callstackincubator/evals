import {
  createStaticNavigation,
  StaticParamList,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useLayoutEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

function DetailsScreen() {
  const navigation = useNavigation()
  const [bookmarked, setBookmarked] = useState(false)

  useLayoutEffect(() => {
    const onTogglePress = () => {
      setBookmarked((value) => !value)
    }

    navigation.setOptions({
      headerRight: () => (
        <Button
          title={bookmarked ? 'Unbookmark' : 'Bookmark'}
          onPress={onTogglePress}
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
    Details: {
      screen: DetailsScreen,
      options: { title: 'Details' },
    },
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

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
