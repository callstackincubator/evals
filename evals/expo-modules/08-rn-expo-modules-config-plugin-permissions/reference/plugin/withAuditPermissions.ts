import { AndroidConfig, ConfigPlugin, IOSConfig, withAndroidManifest, withInfoPlist } from 'expo/config-plugins'

const MICROPHONE = 'android.permission.RECORD_AUDIO'

export const withAuditPermissions: ConfigPlugin<{ microphoneMessage: string }> = (config, props) => {
  config = withInfoPlist(config, (nextConfig) => {
    nextConfig.modResults.NSMicrophoneUsageDescription = props.microphoneMessage
    return nextConfig
  })
  return withAndroidManifest(config, (nextConfig) => {
    AndroidConfig.Permissions.addPermission(nextConfig.modResults, MICROPHONE)
    return nextConfig
  })
}

export default withAuditPermissions
