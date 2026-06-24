import { MaskedView } from '@expo/ui/community/masked-view'
import { MenuView } from '@expo/ui/community/menu'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [message, setMessage] = useState('No action.')
  return (
    <View style={styles.screen}>
      <MenuView actions={[{ id: 'archive', title: 'Archive' }]} onPressAction={({ nativeEvent }) => setMessage(nativeEvent.event)}>
        <Text style={styles.title}>Open menu</Text>
      </MenuView>
      <MaskedView maskElement={<Text style={styles.title}>Mask</Text>}><View style={styles.media} /></MaskedView>
      <Text style={styles.subtitle}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
