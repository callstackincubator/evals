import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const ROW_HEIGHT = 72
const SEPARATOR_HEIGHT = 10

const MESSAGES = Array.from({ length: 18 }, (_, index) => ({
  id: `message-${index + 1}`,
  sender: index % 2 === 0 ? 'Maya' : 'Inbox Bot',
  preview: `Message preview ${index + 1}`,
  unread: index >= 9 && index <= 11,
}))

export default function App() {
  const firstUnreadIndex = MESSAGES.findIndex((message) => message.unread)

  return (
    <View style={styles.screen}>
      <FlatList
        data={MESSAGES}
        getItemLayout={(_, index) => ({
          index,
          length: ROW_HEIGHT + SEPARATOR_HEIGHT,
          offset: (ROW_HEIGHT + SEPARATOR_HEIGHT) * index,
        })}
        initialScrollIndex={firstUnreadIndex === -1 ? 0 : firstUnreadIndex}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.sender}>{item.sender}</Text>
              <Text style={styles.preview}>{item.preview}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  preview: {
    color: '#475569',
    marginTop: 6,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  sender: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  separator: {
    height: SEPARATOR_HEIGHT,
  },
})
