import { Platform } from 'react-native'
import { Host as AndroidHost, Text as AndroidText } from '@expo/ui/jetpack-compose'
import { Host as IOSHost, Text as IOSText } from '@expo/ui/swift-ui'
import { background } from '@expo/ui/swift-ui/modifiers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  if (Platform.OS === 'ios') {
    return <IOSHost style={{ flex: 1 }}><IOSText modifiers={[background('#f8fafc')]}>iOS native UI</IOSText></IOSHost>
  }
  return <AndroidHost style={{ flex: 1 }}><AndroidText>Android native UI</AndroidText></AndroidHost>
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
