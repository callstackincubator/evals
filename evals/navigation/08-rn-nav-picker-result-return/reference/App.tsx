import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type SelectableColor = 'red' | 'green' | 'blue'

type FormScreenProps = StaticScreenProps<{ color: SelectableColor }>

function FormScreen({ route }: FormScreenProps) {
  const navigation = useNavigation()
  const selectedColor = route.params.color

  const pickColor = () => navigation.navigate('ColorPicker')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected color: {selectedColor}</Text>
      <Button title="Choose color" onPress={pickColor} />
    </View>
  )
}

function ColorPickerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>()

  const selectColor = (color: SelectableColor) =>
    navigation.popTo('Form', { color })

  return (
    <View style={styles.container}>
      <Button title="Red" onPress={() => selectColor('red')} />
      <Button title="Green" onPress={() => selectColor('green')} />
      <Button title="Blue" onPress={() => selectColor('blue')} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Form: { screen: FormScreen, initialParams: { color: 'blue' } },
    ColorPicker: {
      screen: ColorPickerScreen,
      options: { presentation: 'modal', title: 'Pick Color' },
    },
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
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
