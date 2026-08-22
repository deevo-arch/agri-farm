import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../api/livestock_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

const speciesOptions = ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'OTHER'];

class AddLivestockScreen extends StatefulWidget {
  const AddLivestockScreen({super.key, this.farmId});

  final int? farmId;

  @override
  State<AddLivestockScreen> createState() => _AddLivestockScreenState();
}

class _AddLivestockScreenState extends State<AddLivestockScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tag = TextEditingController();
  final _dob = TextEditingController();
  String _species = 'COW';
  int? _farmId;
  bool _loadingFarms = true;
  bool _saving = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _farmId = widget.farmId;
    _resolveFarm();
  }

  Future<void> _resolveFarm() async {
    if (_farmId != null) {
      setState(() => _loadingFarms = false);
      return;
    }
    try {
      final farms = await FarmApi.getMine();
      setState(() {
        _farmId = farms.isEmpty ? null : farms.first.id;
        _loadingFarms = false;
        if (farms.isEmpty) _error = 'Register a farm before adding livestock.';
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loadingFarms = false;
      });
    }
  }

  @override
  void dispose() {
    _tag.dispose();
    _dob.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false) || _farmId == null) return;
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      await LivestockApi.create(
        tagNumber: _tag.text.trim(),
        species: _species,
        dateOfBirth: _dob.text.trim(),
        farmId: _farmId!,
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
      title: 'Add livestock',
      body: _loadingFarms
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: AppSpacing.page,
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    FormMessage.error(_error),
                    AppTextField(
                      controller: _tag,
                      labelText: 'Tag number',
                      prefixIcon: Icons.tag,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _species,
                      dropdownColor: AppColors.surface,
                      decoration: const InputDecoration(
                        labelText: 'Species',
                        labelStyle: TextStyle(color: AppColors.muted),
                      ),
                      items: speciesOptions
                          .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.white))))
                          .toList(),
                      onChanged: (value) => setState(() => _species = value ?? 'COW'),
                    ),
                    const SizedBox(height: 12),
                    AppTextField(
                      controller: _dob,
                      labelText: 'Date of birth',
                      prefixIcon: Icons.cake_outlined,
                      readOnly: true,
                      onTap: () => pickIsoDate(context, _dob, allowFuture: false),
                    ),
                    const SizedBox(height: 20),
                    CustomButton(
                      text: 'Save animal',
                      isLoading: _saving,
                      onPressed: _farmId == null ? () {} : _submit,
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
