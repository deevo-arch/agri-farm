import 'package:flutter/foundation.dart';

/// Resolves the Spring Boot origin (no trailing slash).
///
/// Priority order:
/// 1. `--dart-define=API_BASE_URL=http://192.168.x.x:8080`  — full override
/// 2. `--dart-define=API_LAN_IP=192.168.x.x`                — host-only override
/// 3. Auto-detect by platform:
///    • Web (Chrome dev)       → http://localhost:8080
///    • Android emulator       → http://10.0.2.2:8080
///    • iOS simulator          → http://localhost:8080
///    • Physical Android/iOS   → falls back to emulator host (WILL FAIL on real devices)
///                               → always supply API_LAN_IP for real-device runs:
///                               `flutter run --dart-define=API_LAN_IP=<your-pc-local-ip>`
///
/// Find your PC's local IP:
///   Windows: `ipconfig`  (look for IPv4 under your Wi-Fi adapter)
///   macOS  : `ifconfig | grep "inet 192"`
///
/// Example run commands:
///   Emulator  : flutter run
///   Real phone: flutter run --dart-define=API_LAN_IP=192.168.1.42
///   Or full URL: flutter run --dart-define=API_BASE_URL=http://192.168.1.42:8080
class ApiConfig {
  ApiConfig._();

  // ──────────────────────────────────────────────────────────────────────────
  // Compile-time dart-define overrides
  // ──────────────────────────────────────────────────────────────────────────
  static const _envBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const _envLanIp   = String.fromEnvironment('API_LAN_IP');

  /// Backend origin, e.g. `http://192.168.1.42:8080`  (no trailing slash).
  static String get baseUrl {
    // 1. Full URL override
    if (_envBaseUrl.isNotEmpty) {
      var origin = _envBaseUrl;
      if (origin.endsWith('/')) origin = origin.substring(0, origin.length - 1);
      // Strip an accidental trailing /api
      if (origin.endsWith('/api')) origin = origin.substring(0, origin.length - 4);
      return origin;
    }

    // 2. LAN IP override (phone on same Wi-Fi as dev machine)
    if (_envLanIp.isNotEmpty) return 'http://$_envLanIp:8080';

    // 3. Platform defaults
    if (kIsWeb) return 'http://localhost:8080';

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // 10.0.2.2 is the Android emulator's alias for the host machine.
        // On a real device this will NOT work — pass API_LAN_IP instead.
        return 'http://10.0.2.2:8080';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return 'http://localhost:8080';
      default:
        return 'http://localhost:8080';
    }
  }

  /// Convenience: `http://host:port/api`
  static String get apiBase => '$baseUrl/api';
}
