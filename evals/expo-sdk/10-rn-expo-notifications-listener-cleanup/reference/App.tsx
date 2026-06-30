import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

type InboxItem = {
  id: string
  title: string
  body: string
  tapped: boolean
}

export default function App() {
  const [items, setItems] = useState<InboxItem[]>([])

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { identifier, content } = notification.request
        setItems((prev) => [
          {
            id: identifier,
            title: content.title ?? 'Notification',
            body: content.body ?? '',
            tapped: false,
          },
          ...prev,
        ])
      },
    )

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { identifier, content } = response.notification.request
        setItems((prev) => {
          const exists = prev.some((item) => item.id === identifier)
          if (exists) {
            return prev.map((item) =>
              item.id === identifier ? { ...item, tapped: true } : item,
            )
          }
          return [
            {
              id: identifier,
              title: content.title ?? 'Notification',
              body: content.body ?? '',
              tapped: true,
            },
            ...prev,
          ]
        })
      },
    )

    return () => {
      receivedSub.remove()
      responseSub.remove()
    }
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inbox</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, item.tapped && styles.rowTapped]}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowBody}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    color: '#9ca3af',
    marginTop: 24,
    textAlign: 'center',
  },
  row: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginBottom: 8,
    padding: 12,
    rowGap: 4,
  },
  rowBody: {
    color: '#6b7280',
  },
  rowTapped: {
    opacity: 0.6,
  },
  rowTitle: {
    color: '#111827',
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
})
