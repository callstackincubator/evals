import ExpoModulesCore

final class AuditLabelView: ExpoView {
  let label = UILabel()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    label.numberOfLines = 0
    addSubview(label)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    label.frame = bounds
  }
}
