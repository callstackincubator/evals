import React, { useRef } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
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
  const listRef = useRef<any>(null)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Agenda</Text>
      <View style={styles.filters}>
        {AGENDA.map((section, sectionIndex) => {
          return (
            <Pressable
              key={section.title}
              onPress={() => {
                listRef.current?.scrollToLocation({
                  itemIndex: 0,
                  sectionIndex,
                })
              }}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>{section.title}</Text>
            </Pressable>
          )
        })}
      </View>
      <SectionList
        keyExtractor={(item) => item.id}
        ref={listRef}
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
        sections={AGENDA}
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
  filterButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
