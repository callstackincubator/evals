import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, TextInput, View } from 'react-native'

const Tab = createBottomTabNavigator()

function InboxScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Inbox</Text>
    </View>
  )
}

function ComposeScreen({ draft, onDraftChange }: { draft: string; onDraftChange: (value: string) => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
      <Text>Compose</Text>
      <TextInput value={draft} onChangeText={onDraftChange} placeholder='Draft message' style={{ width: '100%', borderWidth: 1, padding: 10 }} />
      <Text>Draft length: {draft.length}</Text>
    </View>
  )
}

export default function App() {
  const [composeDraft, setComposeDraft] = useState('')

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ detachInactiveScreens: true }}>
        <Tab.Screen name='Inbox' component={InboxScreen} />
        <Tab.Screen name='Compose'>
          {() => <ComposeScreen draft={composeDraft} onDraftChange={setComposeDraft} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
}
