import { StyleSheet, Text, View } from 'react-native'

const COLORS = {
  primary: '#2563eb',
  onPrimary: '#ffffff',
  surface: '#f4f4f5',
  onSurface: '#18181b',
}

export default function App() {
  return (
    <View style={[styles.screen, { backgroundColor: COLORS.surface }]}>
      <Text style={[styles.heading, { color: COLORS.onSurface }]}>Today</Text>
      <View style={[styles.banner, { backgroundColor: COLORS.primary }]}>
        <Text style={[styles.bannerText, { color: COLORS.onPrimary }]}>
          You have 3 tasks due
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 12,
    padding: 16,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
    padding: 20,
    rowGap: 16,
  },
})
