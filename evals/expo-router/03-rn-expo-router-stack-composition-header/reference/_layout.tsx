import { Stack } from 'expo-router'
import { Alert, Pressable, Text } from 'react-native'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inbox',
          headerRight: () => (
            <Pressable onPress={() => Alert.alert('New item')}>
              <Text>+</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerBackTitle: 'All mail',
        }}
      />
    </Stack>
  )
}
