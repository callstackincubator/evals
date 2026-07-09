import { Platform, StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Featured</Text>
      <View style={[styles.card, Platform.OS === 'ios' ? styles.cardIos : styles.cardAndroid]}>
        <Text style={styles.cardTitle}>Weekly digest</Text>
        <Text style={styles.cardBody}>Your top stories, every Monday.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    rowGap: 6,
  },
  cardAndroid: {
    borderRadius: 4,
    elevation: 4,
  },
  cardBody: {
    color: '#4b5563',
  },
  cardIos: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#f4f4f5',
    flex: 1,
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
