import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { FlashList, useRecyclingState } from '@shopify/flash-list'

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

function FaqCard({
  item,
}: {
  item: (typeof FAQS)[number]
}) {
  const [isExpanded, setIsExpanded] = useRecyclingState(
    false,
    [item.id],
    () => {}
  )

  return (
    <Pressable onPress={() => setIsExpanded(!isExpanded)} style={styles.card}>
      <Text style={styles.question}>{item.question}</Text>
      {isExpanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
    </Pressable>
  )
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>FAQ</Text>
      <FlashList
        data={FAQS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FaqCard item={item} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  answer: {
    color: '#475569',
    marginTop: 8,
  },
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
