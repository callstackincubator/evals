import ExpoModulesCore

public class AuditLabelModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AuditLabel")
    View(AuditLabelView.self) {
      Prop("title") { (view: AuditLabelView, title: String) in
        view.label.text = title
      }
      Events("onReady")
    }
  }
}
