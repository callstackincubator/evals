import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['itemId: 123']

async function buildDetailsParamsAction() {
  // No-op
  return 'pending'
}

function CatalogScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Catalog</Text>
      <Text style={styles.copy}>
        Catalog routes are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => buildDetailsParamsAction()}
      />
    </View>
  )
}

function CatalogDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>CatalogDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Catalog: CatalogScreen,
    CatalogDetails: CatalogDetailsScreen,
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
