import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list/react-native'

const FAQS = [
  {
    id: 'faq-1',
    question: 'When does the warehouse close?',
    answer: 'The final pickup window ends at 18:00 on weekdays.',
  },
  {
    id: 'faq-2',
    question: 'Can I move a booking?',
    answer: 'Yes, bookings can be rescheduled from the details view.',
  },
  {
    id: 'faq-3',
    question: 'How are damaged items reported?',
    answer: 'Drivers can attach photos before closing the delivery.',
  },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>FAQ</Text>
      <LegendList
        data={FAQS}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text style={styles.question}>{item.question}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
  },
  question: {
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
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
