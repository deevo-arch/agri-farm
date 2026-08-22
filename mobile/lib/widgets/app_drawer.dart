import 'package:flutter/material.dart';

import '../api/auth_api.dart';
import '../core/app_routes.dart';
import '../core/theme.dart';
import '../models/user.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key, required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final items = _itemsFor(user.role);
    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const CircleAvatar(
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.eco, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user.fullName,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(user.role, style: const TextStyle(color: AppColors.primary, fontSize: 12)),
                ],
              ),
            ),
            const Divider(color: AppColors.border),
            Expanded(
              child: ListView(
                children: items
                    .map(
                      (item) => ListTile(
                        leading: Icon(item.icon, color: AppColors.primary),
                        title: Text(item.label, style: const TextStyle(color: Colors.white)),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.pushNamed(context, item.route, arguments: item.argumentBuilder(user));
                        },
                      ),
                    )
                    .toList(),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.muted),
              title: const Text('Sign out', style: TextStyle(color: AppColors.muted)),
              onTap: () async {
                await AuthApi.logout();
                if (!context.mounted) return;
                Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (_) => false);
              },
            ),
          ],
        ),
      ),
    );
  }

  List<_DrawerItem> _itemsFor(String role) {
    switch (role.toUpperCase()) {
      case 'VET':
        return [
          _DrawerItem('Dashboard', Icons.dashboard, AppRoutes.vetDashboard, (u) => u),
          _DrawerItem('Visit queue', Icons.medical_services, AppRoutes.vetVisits, (u) => u),
          _DrawerItem('Profile', Icons.person, AppRoutes.profile, (u) => u),
        ];
      case 'ADMIN':
        return [
          _DrawerItem('Dashboard', Icons.dashboard, AppRoutes.adminDashboard, (u) => u),
          _DrawerItem('Users', Icons.people, AppRoutes.adminUsers, (_) => null),
          _DrawerItem('Create user', Icons.person_add, AppRoutes.createUser, (_) => null),
          _DrawerItem('Profile', Icons.person, AppRoutes.profile, (u) => u),
        ];
      default:
        return [
          _DrawerItem('Dashboard', Icons.dashboard, AppRoutes.farmerDashboard, (u) => u),
          // farmDetail and milkBatches accept null — screens resolve farm via getMine()
          _DrawerItem('My farm', Icons.agriculture, AppRoutes.farmDetail, (_) => null),
          _DrawerItem('Milk batches', Icons.water_drop, AppRoutes.milkBatches, (_) => null),
          _DrawerItem('Treatments', Icons.vaccines, AppRoutes.treatments, (_) => null),
          _DrawerItem('Vet visits', Icons.local_hospital, AppRoutes.farmerVisits, (u) => u),
          _DrawerItem('Profile', Icons.person, AppRoutes.profile, (u) => u),
        ];
    }
  }
}

class _DrawerItem {
  const _DrawerItem(this.label, this.icon, this.route, this.argumentBuilder);

  final String label;
  final IconData icon;
  final String route;
  final Object? Function(User user) argumentBuilder;
}
