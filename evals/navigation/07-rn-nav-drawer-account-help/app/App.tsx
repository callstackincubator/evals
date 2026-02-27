import { StyleSheet, Text, View } from 'react-native'

function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text>Account section</Text>
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text>Help section</Text>
    </View>
  )
}

export default function App() {
  return <View />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
