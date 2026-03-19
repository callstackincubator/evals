import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const CARDS = [
  {
    id: 'card-1',
    status: 'On schedule',
    title: 'City route handoff',
  },
  {
    id: 'card-2',
    highlighted: true,
    status: 'Delayed',
    title: 'Warehouse transfer',
  },
]

export default function App() {
  return (
    <View>
      <Text>Status</Text>
      {CARDS.map((card) => {
        return (
          <View
            key={card.id}
            style={[styles.card, card.highlighted && styles.cardHighlighted]}
          >
            <Text>{card.title}</Text>
            <Text>{card.status}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  cardHighlighted: {
    borderColor: '#dc2626',
  },
})
