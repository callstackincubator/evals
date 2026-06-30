import { Host, RNHostView, Text as UIText } from '@expo/ui'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <Host style={styles.screen}>
      <UIText>Account</UIText>
      <UIText>Signed in as</UIText>
      <UIText>jordan@example.com</UIText>
      <RNHostView>
        <View style={styles.hintWrapper}>
          <Text style={styles.hint}>Manage your profile and notification settings.</Text>
        </View>
      </RNHostView>
    </Host>
  )
}

const styles = StyleSheet.create({
  hint: {
    color: '#6b7280',
  },
  hintWrapper: {
    paddingTop: 8,
  },
  screen: {
    flex: 1,
    padding: 20,
  },
})
