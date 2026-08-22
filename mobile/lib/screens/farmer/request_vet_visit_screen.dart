import 'package:flutter/material.dart';

import '../../api/livestock_api.dart';
import '../../api/vet_visit_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/livestock.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class RequestVetVisitScreen extends StatefulWidget {
  const RequestVetVisitScreen({super.key, required this.livestockId});

  final int livestockId;

  @override
  State<RequestVetVisitScreen> createState() => _RequestVetVisitScreenState();
}

class _RequestVetVisitScreenState extends State<RequestVetVisitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _date = TextEditingController();
  final _reason = TextEditingController();
  final _notes = TextEditingController();
  Livestock? _livestock;
  bool _loading = true;
  bool _saving = false;
  String? _error;
  String _formError = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _date.dispose();
    _reason.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final livestock = await LivestockApi.getById(widget.livestockId);
      if (!mounted) return;
      setState(() {
        _livestock = livestock;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _formError = '';
    });
    try {
      await VetVisitApi.request(
        livestockId: widget.livestockId,
        preferredDate: _date.text.trim(),
        reason: _reason.text.trim(),
        notes: _notes.text.trim(),
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } on ApiException catch (e) {
      setState(() => _formError = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: AuthStorage.instance.session!.toUser(),
      title: 'Request vet visit',
      body: AsyncValueWidget<Livestock>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _livestock,
        builder: (_) => SingleChildScrollView(
          padding: AppSpacing.page,
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                FormMessage.error(_formError),
                Text('Animal: ${_livestock?.tagNumber}', style: const TextStyle(color: Colors.white)),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _date,
                  labelText: 'Preferred date',
                  prefixIcon: Icons.event,
                  readOnly: true,
                  onTap: () => pickIsoDate(context, _date),
                  validator: (v) => (v == null || v.isEmpty) ? 'Choose a date' : null,
                ),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _reason,
                  labelText: 'Reason',
                  prefixIcon: Icons.notes,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter a reason' : null,
                ),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _notes,
                  labelText: 'Notes (optional)',
                  maxLines: 3,
                ),
                const SizedBox(height: 20),
                CustomButton(text: 'Submit request', isLoading: _saving, onPressed: _submit),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
