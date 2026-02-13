import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, TextInput, View } from 'react-native'

const Stack = createNativeStackNavigator()

function StepOneScreen({ navigation, route }: { navigation: any; route: any }) {
  const [firstName, setFirstName] = useState(route.params?.firstName ?? '')

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
      <Text>Step 1</Text>
      <TextInput value={firstName} onChangeText={setFirstName} placeholder='First name' style={{ width: '100%', borderWidth: 1, padding: 8 }} />
      <Button title='Next' onPress={() => navigation.navigate('StepTwo', { firstName })} />
    </View>
  )
}

function StepTwoScreen({ navigation, route }: { navigation: any; route: any }) {
  const [email, setEmail] = useState(route.params?.email ?? '')
  const { firstName } = route.params

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
      <Text>Step 2</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder='Email' style={{ width: '100%', borderWidth: 1, padding: 8 }} />
      <Button title='Back' onPress={() => navigation.goBack()} />
      <Button title='Next' onPress={() => navigation.navigate('StepThree', { firstName, email })} />
    </View>
  )
}

function StepThreeScreen({ navigation, route }: { navigation: any; route: any }) {
  const [city, setCity] = useState(route.params?.city ?? '')
  const { firstName, email } = route.params

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
      <Text>Step 3</Text>
      <TextInput value={city} onChangeText={setCity} placeholder='City' style={{ width: '100%', borderWidth: 1, padding: 8 }} />
      <Button title='Back' onPress={() => navigation.goBack()} />
      <Button title='Summary' onPress={() => navigation.navigate('Summary', { firstName, email, city })} />
    </View>
  )
}

function SummaryScreen({ route }: { route: any }) {
  const { firstName, email, city } = route.params ?? {}

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Text>Summary</Text>
      <Text>firstName: {firstName ?? ''}</Text>
      <Text>email: {email ?? ''}</Text>
      <Text>city: {city ?? ''}</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='StepOne' component={StepOneScreen} />
        <Stack.Screen name='StepTwo' component={StepTwoScreen} />
        <Stack.Screen name='StepThree' component={StepThreeScreen} />
        <Stack.Screen name='Summary' component={SummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
