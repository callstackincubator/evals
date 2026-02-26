import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface ListItem {
  id: string
  name: string
  value: string
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

const ListItem = ({
  item,
  onDelete,
}: {
  item: ListItem
  onDelete: () => void
}) => {
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSequence(
          withTiming(-100, { duration: 200 }),
          withTiming(0, { duration: 200 })
        ),
      },
      {
        scale: withSequence(
          withTiming(0.95, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
      },
    ],
  }))

  const deleteStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(100, { duration: 200 }) }],
    opacity: withTiming(0, { duration: 200 }),
  }))

  const handleLongPress = () => {
    onDelete()
  }

  return (
    <Animated.View style={animatedStyles}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        style={styles.itemContainer}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemValue}>{item.value}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const App = () => {
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: '1', name: 'Item One', value: 'Value 1' },
    { id: '2', name: 'Item Two', value: 'Value 2' },
    { id: '3', name: 'Item Three', value: 'Value 3' },
    { id: '4', name: 'Item Four', value: 'Value 4' },
    { id: '5', name: 'Item Five', value: 'Value 5' },
  ])

  const addNewItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: `New Item ${listItems.length + 1}`,
      value: `Value ${listItems.length + 1}`,
    }
    setListItems((prev) => [newItem, ...prev])
  }

  const removeItem = (id: string) => {
    setListItems((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev
      return prev.filter((item) => item.id !== id)
    })
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    return <ListItem item={item} onDelete={() => removeItem(item.id)} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Animated List</Text>
      <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemValue: {
    fontSize: 16,
    color: '#666',
  },
})

export default App
