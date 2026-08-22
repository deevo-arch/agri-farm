import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'core/app_routes.dart';
import 'core/auth_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthStorage.instance.load();
  ApiClient.initialize();
  runApp(const AgriTrustMobileApp());
}

class AgriTrustMobileApp extends StatelessWidget {
  const AgriTrustMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final session = AuthStorage.instance.session;
    final initialRoute =
        session != null ? AppRoutes.dashboardForRole(session.role) : AppRoutes.login;

    return MaterialApp(
      title: 'AgriTrust Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0C1914),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFFF59E0B),
          surface: Color(0xFF152A22),
        ),
      ),
      initialRoute: initialRoute,
      onGenerateRoute: (settings) {
        // For the initial dashboard route, inject the cached session user.
        if (settings.arguments == null && session != null) {
          const dashboardRoutes = [
            AppRoutes.farmerDashboard,
            AppRoutes.vetDashboard,
            AppRoutes.adminDashboard,
          ];
          if (dashboardRoutes.contains(settings.name)) {
            return AppRoutes.onGenerateRoute(
              RouteSettings(name: settings.name, arguments: session.toUser()),
            );
          }
        }
        return AppRoutes.onGenerateRoute(settings);
      },
      builder: (context, child) =>
          MobileDeviceWrapper(child: child ?? const SizedBox.shrink()),
    );
  }
}

/// Mobile device frame wrapper to display a realistic Smartphone UI on Web browsers
class MobileDeviceWrapper extends StatelessWidget {
  final Widget child;

  const MobileDeviceWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B08),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 430, maxHeight: 860),
          margin: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF0C1914),
            borderRadius: BorderRadius.circular(44),
            border: Border.all(color: const Color(0xFF1F3F33), width: 10),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF10B981).withAlpha(40),
                blurRadius: 40,
                spreadRadius: 2,
                offset: const Offset(0, 15),
              ),
              BoxShadow(
                color: Colors.black.withAlpha(180),
                blurRadius: 50,
                spreadRadius: 10,
              )
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(34),
                child: child,
              ),
              // Phone Speaker Notch
              Align(
                alignment: Alignment.topCenter,
                child: Container(
                  width: 120,
                  height: 24,
                  margin: const EdgeInsets.only(top: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF050B08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F3F33),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
