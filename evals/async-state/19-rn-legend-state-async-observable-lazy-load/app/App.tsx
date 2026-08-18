import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Product = {
  price: number
  title: string
}

type LoadStatus = 'loading' | 'ready' | 'error'

export default function App() {
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const loadProduct = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products/1')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const json = (await response.json()) as Product

        if (!cancelled) {
          setProduct({ price: json.price, title: json.title })
          setStatus('ready')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Product</Text>

      {status === 'error' ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Could not load product.</Text>
        </View>
      ) : status === 'loading' ? (
        <Text style={styles.meta}>Loading product…</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.productTitle}>{product?.title}</Text>
          <Text style={styles.meta}>${product?.price}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
  },
  meta: {
    color: '#334155',
    marginTop: 8,
  },
  productTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
