import 'package:flutter/material.dart';

import '../../api/user_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../models/user.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class EditUserScreen extends StatefulWidget {
  const EditUserScreen({super.key, required this.user});

  final User user;

  @override
  State<EditUserScreen> createState() => _EditUserScreenState();
}

class _EditUserScreenState extends State<EditUserScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _email;
  late String _role;
  bool _saving = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.user.fullName);
    _email = TextEditingController(text: widget.user.email);
    _role = widget.user.role;
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      await UserApi.updateUser(
        widget.user.id,
        fullName: _name.text.trim(),
        email: _email.text.trim(),
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
      title: 'Edit User',
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
              CustomButton(text: 'Save changes', isLoading: _saving, onPressed: _submit),
            ],
          ),
        ),
      ),
    );
  }
}
