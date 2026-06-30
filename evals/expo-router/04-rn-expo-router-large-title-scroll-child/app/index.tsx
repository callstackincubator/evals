import { StyleSheet, Text, View } from 'react-native'

const ITEMS = Array.from({ length: 20 }, (_, i) => `Activity ${i + 1}`)

export default function Index() {
  return (
    <View style={styles.container}>
      {ITEMS.map((item) => (
        <Text key={item} style={styles.row}>
          {item}
        </Text>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  row: { fontSize: 16 },
})
