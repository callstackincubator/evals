import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Form: { color?: string } | undefined
  ColorPicker: { selectedColor: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function FormScreen({ navigation, route }: { navigation: any; route: any }) {
  const [color, setColor] = useState('blue')

  useEffect(() => {
    if (route.params?.color) {
      setColor(route.params.color)
    }
  }, [route.params?.color])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected color: {color}</Text>
      <Button
        title='Choose color'
        onPress={() => navigation.navigate('ColorPicker', { selectedColor: color })}
      />
    </View>
  )
}

function ColorPickerScreen({ navigation }: { navigation: any }) {
  const selectColor = (color: string) => {
    navigation.navigate('Form', { color })
  }

  return (
    <View style={styles.container}>
      <Button title='Red' onPress={() => selectColor('red')} />
      <Button title='Green' onPress={() => selectColor('green')} />
      <Button title='Purple' onPress={() => selectColor('purple')} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Form' component={FormScreen} />
        <Stack.Screen
          name='ColorPicker'
          component={ColorPickerScreen}
          options={{ presentation: 'modal', title: 'Pick Color' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
