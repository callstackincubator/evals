import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const sheetRef = useRef<BottomSheet>(null)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Trip details</Text>
      <Pressable
        onPress={() => sheetRef.current?.expand()}
        style={styles.action}
      >
        <Text style={styles.actionText}>Show summary</Text>
      </Pressable>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={['40%']} enablePanDownToClose>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Summary</Text>
          <Text style={styles.subtitle}>3 nights · 2 guests · $640 total</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  sheetContent: {
    padding: 20,
    rowGap: 6,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
