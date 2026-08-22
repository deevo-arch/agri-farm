import 'package:flutter/material.dart';

import '../../api/user_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../models/user.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';

class UserListScreen extends StatefulWidget {
  const UserListScreen({super.key});

  @override
  State<UserListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends State<UserListScreen> {
  List<User>? _users;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final users = await UserApi.list();
      if (!mounted) return;
      setState(() {
        _users = users;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: AuthStorage.instance.session!.toUser(),
      title: 'Users',
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () async {
          final created = await Navigator.pushNamed(context, AppRoutes.createUser);
          if (created == true) _load();
        },
        child: const Icon(Icons.add),
      ),
      body: AsyncValueWidget<List<User>>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _users,
        builder: (users) => RefreshIndicator(
          onRefresh: _load,
          color: AppColors.primary,
          child: ListView.builder(
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.surface,
                  child: Text(user.fullName[0].toUpperCase(), style: const TextStyle(color: Colors.white)),
                ),
                title: Text(user.fullName, style: const TextStyle(color: Colors.white)),
                subtitle: Text('${user.email} • ${user.role}', style: const TextStyle(color: AppColors.muted)),
                onTap: () async {
                  final updated = await Navigator.pushNamed(context, AppRoutes.editUser, arguments: user);
                  if (updated == true) _load();
                },
              );
            },
          ),
        ),
      ),
    );
  }
}
