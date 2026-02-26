import { ScrollView, StyleSheet, Text, View } from 'react-native'

const HEADER_MAX_HEIGHT = 170
const HEADER_MIN_HEIGHT = 76
const COLLAPSE_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const FEED_ITEMS = Array.from({ length: 12 }, (_, index) => ({
  id: `feed-${index + 1}`,
  title: `Feed item ${index + 1}`,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.headerTitle}>Newsfeed</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {FEED_ITEMS.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>
              A scroll-linked header keeps this layout responsive.
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardBody: {
    color: '#475569',
    fontSize: 13,
    marginTop: 4,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    gap: 10,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  screen: {
    backgroundColor: '#e0f2fe',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
})
