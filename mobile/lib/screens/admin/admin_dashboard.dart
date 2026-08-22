import 'package:flutter/material.dart';

import '../../core/app_routes.dart';
import '../../models/user.dart';
import '../../widgets/role_scaffold.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key, required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: user,
      title: 'Admin Dashboard',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _DashboardCard(
            title: 'Manage Users',
            icon: Icons.people_outline,
            onTap: () => Navigator.pushNamed(context, AppRoutes.adminUsers),
          ),
          // More admin actions can be added here
        ],
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  const _DashboardCard({required this.title, required this.icon, required this.onTap});

  final String title;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF1F2937),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF10B981), size: 32),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 18)),
        trailing: const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
        contentPadding: const EdgeInsets.all(16),
        onTap: onTap,
      ),
    );
  }
}
