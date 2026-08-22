import 'package:flutter/material.dart';

import '../../api/user_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class CreateUserScreen extends StatefulWidget {
  const CreateUserScreen({super.key});

  @override
  State<CreateUserScreen> createState() => _CreateUserScreenState();
}

class _CreateUserScreenState extends State<CreateUserScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  String _role = 'FARMER';
  bool _saving = false;
  String _error = '';

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      await UserApi.create(
        fullName: _name.text.trim(),
        email: _email.text.trim(),
        password: _password.text,
        role: _role,
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: AuthStorage.instance.session!.toUser(),
      title: 'Create User',
      body: SingleChildScrollView(
        padding: AppSpacing.page,
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              FormMessage.error(_error),
              AppTextField(
                controller: _name,
                labelText: 'Full name',
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _email,
                labelText: 'Email',
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _password,
                labelText: 'Password',
                obscureText: true,
                validator: (v) => (v == null || v.length < 6) ? 'Min 6 chars' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _role,
                dropdownColor: AppColors.surface,
                decoration: const InputDecoration(labelText: 'Role', labelStyle: TextStyle(color: AppColors.muted)),
                items: ['FARMER', 'VET', 'ADMIN']
                    .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(color: Colors.white))))
                    .toList(),
                onChanged: (v) => setState(() => _role = v!),
              ),
              const SizedBox(height: 20),
              CustomButton(text: 'Create user', isLoading: _saving, onPressed: _submit),
            ],
          ),
        ),
      ),
    );
  }
}
