import Foundation

/// Contains all codes related to routing between the app's screens-
enum RoutingErrorCode: String {
  /// Default error code for any problem that might happen during routing to a screen:
  /// a missing dependency,
  /// a missing container view controller, etc.
  /// Use this in presenters wrapping router exceptions
  case failedRouting = "FAILED_ROUTING"
  
  /// Error indicating a missing dependency needed to open a screen-
  case noDependency = "NO_DEPENDENCY"
}
