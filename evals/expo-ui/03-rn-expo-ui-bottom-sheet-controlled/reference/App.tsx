import { BottomSheet, BottomSheetModalProvider, BottomSheetView } from '@expo/ui/community/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const ref = useRef<BottomSheet>(null)
  return (
    <BottomSheetModalProvider>
      <View style={styles.screen}>
        <Pressable onPress={() => ref.current?.present()} style={styles.action}><Text style={styles.actionText}>Open sheet</Text></Pressable>
        <BottomSheet ref={ref} index={-1} snapPoints={['40%']} onDismiss={() => {}}>
          <BottomSheetView><Text>Sheet content</Text></BottomSheetView>
        </BottomSheet>
      </View>
    </BottomSheetModalProvider>
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
