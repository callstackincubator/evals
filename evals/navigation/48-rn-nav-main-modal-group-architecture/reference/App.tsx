import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  const handleOpenCompose = () => {
    navigation.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Open details" onPress={handleOpenDetails} />
      <Button title="Open compose modal" onPress={handleOpenCompose} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text>Main details route</Text>
    </View>
  )
}

function ComposeModalScreen() {
  const navigation = useNavigation()

  const handleDismiss = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.modal}>
      <Text>Modal compose route</Text>
      <Button title="Dismiss" onPress={handleDismiss} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Group>

        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ComposeModal" component={ComposeModalScreen} />
        </Stack.Group>
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
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
