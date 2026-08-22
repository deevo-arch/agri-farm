import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../models/user.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class CreateFarmScreen extends StatefulWidget {
  const CreateFarmScreen({super.key, this.ownerId});

  final int? ownerId;

  @override
  State<CreateFarmScreen> createState() => _CreateFarmScreenState();
}

class _CreateFarmScreenState extends State<CreateFarmScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _location = TextEditingController();
  bool _saving = false;
  String _error = '';

  User get _user => AuthStorage.instance.session!.toUser();

  @override
  void dispose() {
    _name.dispose();
    _location.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      await FarmApi.create(
        name: _name.text.trim(),
        location: _location.text.trim(),
        ownerId: widget.ownerId ?? _user.id,
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
      user: _user,
      title: 'Register farm',
      body: SingleChildScrollView(
        padding: AppSpacing.page,
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              FormMessage.error(_error),
              AppTextField(
                controller: _name,
                labelText: 'Farm name',
                prefixIcon: Icons.agriculture,
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _location,
                labelText: 'Location',
                prefixIcon: Icons.location_on_outlined,
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 20),
              CustomButton(text: 'Create farm', isLoading: _saving, onPressed: _submit),
            ],
          ),
        ),
      ),
    );
  }
}
