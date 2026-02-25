import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  cta: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
})
