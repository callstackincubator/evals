import { NativeTabs } from 'expo-router/unstable-native-tabs'

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label selectedStyle={{ color: '#111827' }}>Home</NativeTabs.Trigger.Label>
        
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
