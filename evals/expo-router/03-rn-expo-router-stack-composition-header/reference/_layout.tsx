import { Stack } from 'expo-router'
import { Alert } from 'react-native'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index">
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="plus" onPress={() => Alert.alert('New item')} />
        </Stack.Toolbar>
      </Stack.Screen>
    </Stack>
  )
}
