import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'audit',
  slug: 'audit',
  plugins: [
    ['./plugin/withAuditPermissions', { cameraMessage: 'Allow camera access to run a device audit.' }],
  ],
}

export default config
