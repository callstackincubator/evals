import { AndroidConfig, ConfigPlugin, withAndroidManifest, withInfoPlist } from 'expo/config-plugins'

const CAMERA = 'android.permission.CAMERA'

export const withAuditPermissions: ConfigPlugin<{ cameraMessage: string }> = (config, props) => {
  config = withInfoPlist(config, (nextConfig) => {
    nextConfig.modResults.NSCameraUsageDescription = props.cameraMessage
    return nextConfig
  })
  return withAndroidManifest(config, (nextConfig) => {
    AndroidConfig.Permissions.addPermission(nextConfig.modResults, CAMERA)
    return nextConfig
  })
}

export default withAuditPermissions
