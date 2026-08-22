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

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, required this.user});

  final User user;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _email;
  bool _loading = true;
  bool _saving = false;
  String _error = '';
  String _success = '';

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.user.fullName);
    _email = TextEditingController(text: widget.user.email);
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final user = await UserApi.getById(widget.user.id);
      if (!mounted) return;
      _name.text = user.fullName;
      _email.text = user.email;
      setState(() => _loading = false);
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Unable to load profile.';
        _loading = false;
      });
    }
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = '';
      _success = '';
    });
    try {
      final updated = await UserApi.updateMe(
        fullName: _name.text.trim(),
        email: _email.text.trim(),
      );
      final session = AuthStorage.instance.session;
      if (session != null) {
        await AuthStorage.instance.save(session.copyWith(name: updated.fullName));
      }
      if (!mounted) return;
      setState(() => _success = 'Profile updated successfully.');
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: widget.user,
      title: 'My profile',
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: AppSpacing.page,
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    FormMessage.error(_error),
                    FormMessage.success(_success),
                    AppTextField(
                      controller: _name,
                      labelText: 'Full name',
                      prefixIcon: Icons.person_outline,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    AppTextField(
                      controller: _email,
                      labelText: 'Email',
                      prefixIcon: Icons.email_outlined,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text('Role: ${widget.user.role}', style: const TextStyle(color: AppColors.muted)),
                    ),
                    const SizedBox(height: 20),
                    CustomButton(text: 'Save changes', isLoading: _saving, onPressed: _save),
                  ],
                ),
              ),
            ),
    );
  }
}
