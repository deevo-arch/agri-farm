import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../models/user.dart';
import 'app_drawer.dart';

class RoleScaffold extends StatelessWidget {
  const RoleScaffold({
    super.key,
    required this.user,
    required this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
  });

  final User user;
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: AppDrawer(user: user),
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: Text(title),
        actions: actions,
      ),
      floatingActionButton: floatingActionButton,
      body: body,
    );
  }
}
