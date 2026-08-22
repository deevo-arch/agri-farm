import 'package:flutter/material.dart';

import '../../api/treatment_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class RecordTreatmentScreen extends StatefulWidget {
  const RecordTreatmentScreen({super.key, required this.livestockId, this.vetVisitId});

  final int livestockId;
  final int? vetVisitId;

  @override
  State<RecordTreatmentScreen> createState() => _RecordTreatmentScreenState();
}

class _RecordTreatmentScreenState extends State<RecordTreatmentScreen> {
  String _kind = 'VACCINATION';
  final _name = TextEditingController();
  final _dosage = TextEditingController();
  final _date = TextEditingController(text: todayIsoDate());
  final _withdrawal = TextEditingController();
  bool _saving = false;
  String _error = '';
  String _success = '';

  @override
  void dispose() {
    _name.dispose();
    _dosage.dispose();
    _date.dispose();
    _withdrawal.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty || _date.text.isEmpty) {
      setState(() => _error = 'Name and administered date are required.');
      return;
    }
    if (_kind == 'MEDICATION' && _dosage.text.trim().isEmpty) {
      setState(() => _error = 'Dosage is required for medication.');
      return;
    }
    setState(() {
      _saving = true;
      _error = '';
      _success = '';
    });
    try {
      if (_kind == 'VACCINATION') {
        await TreatmentApi.createVaccination(
          livestockId: widget.livestockId,
          vetVisitId: widget.vetVisitId,
          vaccineName: _name.text.trim(),
          administeredDate: _date.text.trim(),
          withdrawalEndDate: _withdrawal.text.trim().isEmpty ? null : _withdrawal.text.trim(),
        );
      } else {
        await TreatmentApi.createMedication(
          livestockId: widget.livestockId,
          vetVisitId: widget.vetVisitId,
          medicationName: _name.text.trim(),
          dosage: _dosage.text.trim(),
          administeredDate: _date.text.trim(),
          withdrawalEndDate: _withdrawal.text.trim().isEmpty ? null : _withdrawal.text.trim(),
        );
      }
      setState(() => _success = 'Treatment recorded.');
      await Future<void>.delayed(const Duration(milliseconds: 600));
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
      title: 'Record treatment',
      body: SingleChildScrollView(
        padding: AppSpacing.page,
        child: Column(
          children: [
            FormMessage.error(_error),
            FormMessage.success(_success),
            DropdownButtonFormField<String>(
              initialValue: _kind,
              dropdownColor: AppColors.surface,
              items: const [
                DropdownMenuItem(value: 'VACCINATION', child: Text('Vaccination', style: TextStyle(color: Colors.white))),
                DropdownMenuItem(value: 'MEDICATION', child: Text('Medication', style: TextStyle(color: Colors.white))),
              ],
              onChanged: (value) => setState(() => _kind = value ?? 'VACCINATION'),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _name,
              labelText: _kind == 'VACCINATION' ? 'Vaccine name' : 'Medication name',
            ),
            if (_kind == 'MEDICATION') ...[
              const SizedBox(height: 12),
              AppTextField(controller: _dosage, labelText: 'Dosage'),
            ],
            const SizedBox(height: 12),
            AppTextField(
              controller: _date,
              labelText: 'Administered date',
              readOnly: true,
              onTap: () => pickIsoDate(context, _date, allowFuture: false),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: _withdrawal,
              labelText: 'Withdrawal end date (optional)',
              readOnly: true,
              onTap: () => pickIsoDate(context, _withdrawal),
            ),
            const SizedBox(height: 20),
            CustomButton(text: 'Save treatment', isLoading: _saving, onPressed: _submit),
          ],
        ),
      ),
    );
  }
}
