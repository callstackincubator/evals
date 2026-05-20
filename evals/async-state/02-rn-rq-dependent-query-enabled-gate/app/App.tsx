import { StyleSheet, Text, View } from 'react-native'

function ProjectsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile & Projects</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Projects</Text>
      </View>
    </View>
  )
}

export default function App() {
  return (
    <ProjectsScreen />
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  muted: {
    color: '#64748b',
  },
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
