import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['Red', 'Green', 'Blue']

async function setPickedColorPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function FormScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Form</Text>
      <Text style={styles.copy}>
        Color options are seeded for picker return behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => setPickedColorPlaceholder()}
      />
    </View>
  )
}

function ColorPickerScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ColorPicker</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Form: FormScreen,
    ColorPicker: ColorPickerScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
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
