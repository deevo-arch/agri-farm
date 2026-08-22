import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../models/farm.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class EditFarmScreen extends StatefulWidget {
  const EditFarmScreen({super.key, required this.farm});

  final Farm farm;

  @override
  State<EditFarmScreen> createState() => _EditFarmScreenState();
}

class _EditFarmScreenState extends State<EditFarmScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _location;
  bool _saving = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.farm.name);
    _location = TextEditingController(text: widget.farm.location);
  }

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
      await FarmApi.update(
        widget.farm.id,
        name: _name.text.trim(),
        location: _location.text.trim(),
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
      title: 'Edit farm',
      body: SingleChildScrollView(
        padding: AppSpacing.page,
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              FormMessage.error(_error),
              AppTextField(controller: _name, labelText: 'Farm name', prefixIcon: Icons.agriculture),
              const SizedBox(height: 12),
              AppTextField(controller: _location, labelText: 'Location', prefixIcon: Icons.location_on_outlined),
              const SizedBox(height: 20),
              CustomButton(text: 'Save farm', isLoading: _saving, onPressed: _submit),
            ],
          ),
        ),
      ),
    );
  }
}
