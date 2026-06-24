import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [message, setMessage] = useState('Ready.')

  const getToken = async () => {
    const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      setMessage('Push tokens require an EAS project id; configure extra.eas.projectId for this build.')
      return
    }
    const permission = await Notifications.requestPermissionsAsync()
    if (!permission.granted) {
      setMessage('Notification permission denied.')
      return
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    setMessage(token.data)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Project token</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Pressable onPress={getToken} style={styles.action}><Text style={styles.actionText}>Get token</Text></Pressable>
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
