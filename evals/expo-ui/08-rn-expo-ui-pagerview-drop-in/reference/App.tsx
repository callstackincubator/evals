import { PagerView } from '@expo/ui/community/pager-view'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const PAGES = [
  { key: 'welcome', title: 'Welcome', body: 'Track your habits in one place.' },
  { key: 'reminders', title: 'Reminders', body: 'Get nudged at the right time.' },
  { key: 'insights', title: 'Insights', body: 'See your streaks grow.' },
]

export default function App() {
  const [page, setPage] = useState(0)

  return (
    <View style={styles.screen}>
      <PagerView
        initialPage={0}
        onPageSelected={(event) => setPage(event.nativeEvent.position)}
        style={styles.pager}
      >
        {PAGES.map((item) => (
          <View key={item.key} style={styles.page}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}
      </PagerView>

      <Text style={styles.indicator}>
        {page + 1} / {PAGES.length}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    color: '#4b5563',
    textAlign: 'center',
  },
  indicator: {
    color: '#6b7280',
    textAlign: 'center',
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    rowGap: 8,
  },
  pager: {
    flex: 1,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
})
