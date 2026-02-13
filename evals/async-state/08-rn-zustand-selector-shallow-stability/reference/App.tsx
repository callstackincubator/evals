import { useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type PanelState = {
  clicks: number
  label: string
}

type DashboardStore = {
  leftPanel: PanelState
  rightPanel: PanelState
  incrementLeft: () => void
  incrementRight: () => void
}

const useDashboardStore = create<DashboardStore>((set) => {
  return {
    incrementLeft: () => {
      set((state) => ({
        leftPanel: { ...state.leftPanel, clicks: state.leftPanel.clicks + 1 },
      }))
    },
    incrementRight: () => {
      set((state) => ({
        rightPanel: { ...state.rightPanel, clicks: state.rightPanel.clicks + 1 },
      }))
    },
    leftPanel: { clicks: 0, label: 'Left panel' },
    rightPanel: { clicks: 0, label: 'Right panel' },
  }
})

function Panel({ side }: { side: 'left' | 'right' }) {
  const renderCount = useRef(0)
  renderCount.current += 1

  const panel = useDashboardStore(
    useShallow((state) => {
      return side === 'left' ? state.leftPanel : state.rightPanel
    })
  )

  const increment = useDashboardStore((state) => {
    return side === 'left' ? state.incrementLeft : state.incrementRight
  })

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{panel.label}</Text>
      <Text>Clicks: {panel.clicks}</Text>
      <Text style={styles.meta}>Renders: {renderCount.current}</Text>
      <Pressable onPress={increment} style={styles.button}>
        <Text style={styles.buttonText}>Increment</Text>
      </Pressable>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Selector stability</Text>
      <View style={styles.row}>
        <Panel side='left' />
        <Panel side='right' />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  meta: {
    color: '#64748b',
    marginTop: 4,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    padding: 12,
  },
  panelTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  screen: {
    backgroundColor: '#f1f5f9',
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
