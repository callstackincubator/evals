import { StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
    </View>
  )
}

function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
    </View>
  )
}

export default function App() {
  return <View />
}

const styles = StyleSheet.create({
  copy: {
    color: '#6b7280',
    textAlign: 'center',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
