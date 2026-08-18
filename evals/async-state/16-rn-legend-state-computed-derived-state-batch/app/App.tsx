import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type CatalogItem = {
  id: number
  price: number
  title: string
}

const CATALOG: CatalogItem[] = [
  { id: 1, price: 12, title: 'Espresso beans' },
  { id: 2, price: 8, title: 'Pour-over filters' },
  { id: 3, price: 24, title: 'Ceramic mug' },
]

export default function App() {
  const [quantities, setQuantities] = useState<Record<number, number>>({
    1: 1,
    2: 0,
    3: 0,
  })

  const promoApplied = false
  const discount = 0
  const itemCount = 0
  const subtotal = 0

  const changeQuantity = (id: number, delta: number) => {
    setQuantities((previous) => ({
      ...previous,
      [id]: Math.max(0, (previous[id] ?? 0) + delta),
    }))
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cart</Text>

      {CATALOG.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.meta}>${item.price}</Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => changeQuantity(item.id, -1)}
              style={styles.stepButton}
            >
              <Text style={styles.stepButtonText}>-</Text>
            </Pressable>
            <Text style={styles.meta}>{quantities[item.id] ?? 0}</Text>
            <Pressable
              onPress={() => changeQuantity(item.id, 1)}
              style={styles.stepButton}
            >
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.summary}>
        <Text style={styles.meta}>Items {itemCount}</Text>
        <Text style={styles.meta}>Subtotal ${subtotal}</Text>
        <Text style={styles.meta}>Discount ${discount}</Text>
        <Text style={styles.meta}>
          Promo {promoApplied ? 'applied' : 'none'}
        </Text>
      </View>

      <Pressable onPress={() => {}} style={styles.button}>
        <Text style={styles.buttonText}>Apply promo</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemTitle: {
    color: '#0f172a',
    fontWeight: '600',
  },
  meta: {
    color: '#334155',
    marginTop: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  stepButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stepButtonText: {
    color: '#334155',
    fontWeight: '700',
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
