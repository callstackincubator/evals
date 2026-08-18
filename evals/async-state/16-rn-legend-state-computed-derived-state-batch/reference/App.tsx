import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { batch, observable } from '@legendapp/state'
import { Memo, observer, useValue } from '@legendapp/state/react'

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

const PROMO_DISCOUNT = 5

const cart$ = observable({
  discount: 0,
  promoApplied: false,
  quantities: { 1: 1, 2: 0, 3: 0 } as Record<number, number>,
  itemCount: (): number => {
    const quantities = cart$.quantities.get()

    return CATALOG.reduce((sum, item) => sum + (quantities[item.id] ?? 0), 0)
  },
  subtotal: (): number => {
    const quantities = cart$.quantities.get()

    return CATALOG.reduce(
      (sum, item) => sum + item.price * (quantities[item.id] ?? 0),
      0
    )
  },
})

const changeQuantity = (id: number, delta: number) => {
  cart$.quantities[id].set((quantity) => Math.max(0, (quantity ?? 0) + delta))
}

const applyPromo = () => {
  batch(() => {
    cart$.promoApplied.set(true)
    cart$.discount.set(PROMO_DISCOUNT)
  })
}

function CartItemRow({ item }: { item: CatalogItem }) {
  const quantity = useValue(cart$.quantities[item.id])

  return (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.meta}>${item.price}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => changeQuantity(item.id, -1)}
          style={styles.stepButton}
        >
          <Text style={styles.stepButtonText}>-</Text>
        </Pressable>
        <Text style={styles.meta}>{quantity ?? 0}</Text>
        <Pressable
          onPress={() => changeQuantity(item.id, 1)}
          style={styles.stepButton}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

const CartSummary = observer(function CartSummary() {
  const itemCount = useValue(cart$.itemCount)
  const subtotal = useValue(cart$.subtotal)
  const discount = useValue(cart$.discount)
  const promoApplied = useValue(cart$.promoApplied)

  return (
    <View style={styles.summary}>
      <Text style={styles.meta}>Items {itemCount}</Text>
      <Text style={styles.meta}>Subtotal ${subtotal}</Text>
      <Text style={styles.meta}>Discount ${discount}</Text>
      <Text style={styles.meta}>Promo {promoApplied ? 'applied' : 'none'}</Text>
    </View>
  )
})

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cart</Text>

      {CATALOG.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}

      <Memo>{() => <CartSummary />}</Memo>

      <Pressable onPress={applyPromo} style={styles.button}>
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
