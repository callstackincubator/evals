import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

const STEP_FIELDS = {
  stepOne: 'First name',
  stepTwo: 'Email',
  stepThree: 'City',
}

async function submitStepAction() {
  // No-op
  return 'pending'
}

function StepOneScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>StepOne</Text>
      <TextInput placeholder={STEP_FIELDS.stepOne} style={styles.input} />
      <Button
        title="Open"
        onPress={() => submitStepAction()}
      />
    </View>
  )
}

function StepTwoScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>StepTwo</Text>
      <TextInput placeholder={STEP_FIELDS.stepTwo} style={styles.input} />
    </View>
  )
}

function StepThreeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>StepThree</Text>
      <TextInput placeholder={STEP_FIELDS.stepThree} style={styles.input} />
    </View>
  )
}

function SummaryScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Summary</Text>
      <Text style={styles.copy}>
        Step data summary.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    StepOne: StepOneScreen,
    StepTwo: StepTwoScreen,
    StepThree: StepThreeScreen,
    Summary: SummaryScreen,
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
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
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
