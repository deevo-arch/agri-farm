import 'package:flutter/material.dart';

import '../../api/livestock_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/livestock.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';
import 'add_livestock_screen.dart';

const statusOptions = ['ACTIVE', 'SOLD', 'DECEASED'];

class EditLivestockScreen extends StatefulWidget {
  const EditLivestockScreen({super.key, required this.livestock});

  final Livestock livestock;

  @override
  State<EditLivestockScreen> createState() => _EditLivestockScreenState();
}

class _EditLivestockScreenState extends State<EditLivestockScreen> {
  late String _species;
  late String _status;
  late final TextEditingController _dob;
  bool _saving = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _species = widget.livestock.species;
    _status = widget.livestock.status;
    _dob = TextEditingController(text: widget.livestock.dateOfBirth);
  }

  @override
  void dispose() {
    _dob.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      await LivestockApi.update(
        widget.livestock.id,
        species: _species,
        dateOfBirth: _dob.text.trim(),
        status: _status,
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
      title: 'Edit ${widget.livestock.tagNumber}',
      body: SingleChildScrollView(
        padding: AppSpacing.page,
        child: Column(
          children: [
            FormMessage.error(_error),
            DropdownButtonFormField<String>(
              initialValue: _species,
              dropdownColor: AppColors.surface,
              items: speciesOptions
                  .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.white))))
                  .toList(),
              onChanged: (value) => setState(() => _species = value ?? _species),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _status,
              dropdownColor: AppColors.surface,
              items: statusOptions
                  .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.white))))
                  .toList(),
              onChanged: (value) => setState(() => _status = value ?? _status),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _dob,
              labelText: 'Date of birth',
              readOnly: true,
              onTap: () => pickIsoDate(context, _dob, allowFuture: false),
            ),
            const SizedBox(height: 20),
            CustomButton(text: 'Save livestock', isLoading: _saving, onPressed: _submit),
          ],
        ),
      ),
    );
  }
}
