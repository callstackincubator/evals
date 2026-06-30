import ExpoModulesCore

final class AuditLabelView: ExpoView {
  let label = UILabel()
  let onReady = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    label.numberOfLines = 0
    addSubview(label)

    let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
    addGestureRecognizer(tapGesture)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    label.frame = bounds
  }

  @objc
  private func handleTap() {
    onReady()
  }
}
