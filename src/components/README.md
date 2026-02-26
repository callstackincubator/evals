# Camera Components

This directory contains the camera entry flow component that demonstrates:

- Camera permission request on demand
- Permission denial handling with retry and settings recovery
- Conditional rendering based on access status
- Camera preview only when access is granted

## Usage

The `CameraEntry` component handles all camera permission logic internally:

```typescript
import CameraEntry from './components/CameraEntry'

// Use directly in your app
export default function App() {
  return <CameraEntry />
}
```

## Features

1. **Permission Request on Demand**: Automatically requests camera permission when needed
2. **Denial Recovery**: Provides retry option if permission is denied
3. **Settings Recovery**: Direct link to app settings if permission is denied
4. **Conditional Preview**: Camera preview only renders when access is granted
5. **Front/Back Camera Toggle**: Simple control to flip between camera modes

## Requirements

- `expo-camera` installed
- Camera permission handled by Expo's permission system
