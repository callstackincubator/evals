import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'

import EvalApp from '../evals/animation/01-rn-anim-pressable-scale-with-timing/app/App'
import EvalReference from '../evals/animation/01-rn-anim-pressable-scale-with-timing/reference/App'

const EVAL_ID = 'animation/01-rn-anim-pressable-scale-with-timing'

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        id="MainNavigator"
        screenOptions={{
          headerTitle: `Evals testbench - ${EVAL_ID}`,
          tabBarActiveTintColor: '#1f4fd1',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen name='App' component={EvalApp} />
        <Tab.Screen name='Ref' component={EvalReference} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
