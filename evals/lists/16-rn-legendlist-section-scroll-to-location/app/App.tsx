import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SectionList } from '@legendapp/list/section-list'

const AGENDA = [
  {
    data: [
      { id: 'event-1', title: 'Warehouse review', time: '09:00' },
      { id: 'event-2', title: 'Driver sync', time: '11:30' },
    ],
    title: 'Monday',
  },
  {
    data: [
      { id: 'event-3', title: 'Returns audit', time: '10:00' },
      { id: 'event-4', title: 'Ops planning', time: '14:00' },
    ],
    title: 'Tuesday',
  },
  {
    data: [
      { id: 'event-5', title: 'Carrier sync', time: '08:30' },
      { id: 'event-6', title: 'Dock walk', time: '15:00' },
    ],
    title: 'Wednesday',
  },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Agenda</Text>
      <SectionList
        sections={AGENDA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          )
        }}
        renderSectionHeader={({ section }) => {
          return <Text style={styles.header}>{section.title}</Text>
        }}
        stickySectionHeadersEnabled
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  header: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 12,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  time: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
