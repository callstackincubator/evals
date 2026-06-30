import ExpoModulesCore

public class WeatherModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WeatherModule")

    Function("unit") {
      return "celsius"
    }

    Function("currentTemperature") {
      return 21
    }
  }
}
