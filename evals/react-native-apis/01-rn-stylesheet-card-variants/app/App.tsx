import React from 'react'
import { Text, View } from 'react-native'

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
          <View key={card.id}>
            <Text>{card.title}</Text>
            <Text>{card.status}</Text>
          </View>
        )
      })}
    </View>
  )
}
