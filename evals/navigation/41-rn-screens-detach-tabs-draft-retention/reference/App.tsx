import { createContext, useContext, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, Text, TextInput, View } from 'react-native'

const DraftContext = createContext<{
  draft: string
  onDraftChange: (value: string) => void
}>({ draft: '', onDraftChange: () => {} })

function InboxScreen() {
  return (
    <View style={styles.centered}>
      <Text>Inbox</Text>
    </View>
  )
}

function ComposeScreen() {
  const { draft, onDraftChange } = useContext(DraftContext)

  return (
    <View style={styles.compose}>
      <Text>Compose</Text>
      <TextInput
        value={draft}
        onChangeText={onDraftChange}
        placeholder="Draft message"
        style={styles.input}
      />
      <Text>Draft length: {draft.length}</Text>
    </View>
  )
}

const HomeTabs = createBottomTabNavigator({
  screenOptions: { detachInactiveScreens: true },
  screens: {
    Inbox: InboxScreen,
    Compose: ComposeScreen,
  },
})

type HomeTabsParamList = StaticParamList<typeof HomeTabs>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends HomeTabsParamList {}
  }
}

const Navigation = createStaticNavigation(HomeTabs)

export default function App() {
  const [composeDraft, setComposeDraft] = useState('')

  const draftContext = {
    draft: composeDraft,
    onDraftChange: setComposeDraft,
  }

  return (
    <DraftContext.Provider value={draftContext}>
      <Navigation />
    </DraftContext.Provider>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compose: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 10,
  },
})
