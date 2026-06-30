import ExpoModulesCore

public class WeatherInlineModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WeatherInlineModule")

    Function("unit") {
      return "celsius"
    }

    Function("currentTemperature") {
      return 21
    }
  }
}
