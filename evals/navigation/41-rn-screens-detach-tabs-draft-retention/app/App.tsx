import { useState } from 'react'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

type ComposeDraft = {
  body: string
}

let draftCache: ComposeDraft = {
  body: '',
}

function loadDraft() {
  // TODO: load draft from durable store
  return draftCache
}

function saveDraft(nextDraft: ComposeDraft) {
  // TODO: persist draft across tab detach/attach
  draftCache = nextDraft
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
    </View>
  )
}

function ComposeScreen() {
  const [draftPreview, setDraftPreview] = useState(loadDraft().body || '(empty)')

  const updateDraftPlaceholder = () => {
    const nextDraft = { body: 'placeholder-draft' }
    saveDraft(nextDraft)
    setDraftPreview(nextDraft.body)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Compose</Text>
      <Text style={styles.subtitle}>Draft: {draftPreview}</Text>
      <Button title="Call draft placeholders" onPress={updateDraftPlaceholder} />
    </View>
  )
}

const Tabs = createBottomTabNavigator({
  screens: {
    Feed: FeedScreen,
    Compose: ComposeScreen,
  },
})

const Navigation = createStaticNavigation(Tabs)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
