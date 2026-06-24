package expo.modules.deviceaudit

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceAuditModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceAuditModule")
    Constant("source") { "inline" }
  }
}
