package expo.modules.weatherinline

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WeatherInlineModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WeatherInlineModule")
    Function("unit") {
      "celsius"
    }
  }
}
