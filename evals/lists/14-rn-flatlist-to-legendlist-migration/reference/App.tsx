import React from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { LegendList } from '@legendapp/list'

const ITEMS = [
  { id: 'item-1', title: 'Shift overview', subtitle: 'Morning operations' },
  { id: 'item-2', title: 'Driver queue', subtitle: 'Pending check-ins' },
  { id: 'item-3', title: 'Returns desk', subtitle: 'Open incidents' },
  { id: 'item-4', title: 'Stock audit', subtitle: 'Afternoon checklist' },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <LegendList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        recycleItems
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
  },
  rowSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
  rowTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
})
