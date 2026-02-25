import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Derived threshold state machine</Text>
      <View style={styles.track}>
        <View style={styles.fill} />
      </View>
      <Text style={styles.phase}>idle</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: '#60a5fa',
    borderRadius: 999,
    height: '100%',
    width: '30%',
  },
  phase: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  track: {
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: 260,
  },
})
