import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SectionList } from '@legendapp/list/section-list'

const EVENTS = [
  { id: 'event-1', day: 'Monday', title: 'Warehouse review', time: '09:00' },
  { id: 'event-2', day: 'Monday', title: 'Driver sync', time: '11:30' },
  { id: 'event-3', day: 'Tuesday', title: 'Returns audit', time: '10:00' },
  { id: 'event-4', day: 'Tuesday', title: 'Ops planning', time: '14:00' },
]

const sections = EVENTS.reduce<
  Array<{
    data: typeof EVENTS
    title: string
  }>
>((allSections, event) => {
  const lastSection = allSections[allSections.length - 1]

  if (!lastSection || lastSection.title !== event.day) {
    allSections.push({
      data: [event],
      title: event.day,
    })
  } else {
    lastSection.data.push(event)
  }

  return allSections
}, [])

export default function App() {
  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
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
})
