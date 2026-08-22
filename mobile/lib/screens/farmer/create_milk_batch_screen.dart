import 'package:flutter/material.dart';

import '../../api/auth_api.dart';
import '../../api/farm_api.dart';
import '../../api/milk_batch_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/livestock.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

String _randomBatchCode() {
  final date = todayIsoDate().substring(2).replaceAll('-', '');
  final n = DateTime.now().millisecondsSinceEpoch % 900 + 100;
  return 'BATCH-$date-$n';
}

class CreateMilkBatchScreen extends StatefulWidget {
  const CreateMilkBatchScreen({super.key, this.farmId, this.livestock = const []});

  final int? farmId;
  final List<Livestock> livestock;

  @override
  State<CreateMilkBatchScreen> createState() => _CreateMilkBatchScreenState();
}

class _CreateMilkBatchScreenState extends State<CreateMilkBatchScreen> {
  final _formKey = GlobalKey<FormState>();
  final _code = TextEditingController(text: _randomBatchCode());
  final _date = TextEditingController(text: todayIsoDate());
  final _qty = TextEditingController();
  List<Livestock> _animals = const [];
  final Set<int> _selected = {};
  int? _farmId;
  bool _loading = true;
  bool _saving = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    try {
      var farmId = widget.farmId;
      var animals = widget.livestock;
      if (farmId == null) {
        final farms = await FarmApi.getMine();
        farmId = farms.isEmpty ? null : farms.first.id;
      }
      if (farmId != null && animals.isEmpty) {
        animals = await FarmApi.getLivestock(farmId);
      }
      setState(() {
        _farmId = farmId;
        _animals = animals;
        if (animals.isNotEmpty) _selected.add(animals.first.id);
        _loading = false;
        if (farmId == null) _error = 'Register a farm first.';
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _code.dispose();
    _date.dispose();
    _qty.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false) || _farmId == null) return;
    if (_selected.isEmpty) {
      setState(() => _error = 'Select at least one animal.');
      return;
    }
    setState(() {
      _saving = true;
      _error = '';
    });
    try {
      final session = AuthStorage.instance.session!;
      await MilkBatchApi.create(
        batchCode: _code.text.trim(),
        farmId: _farmId!,
        collectedById: session.userId,
        collectionDate: _date.text.trim(),
        quantityLitres: double.parse(_qty.text.trim()),
        livestockIds: _selected.toList(),
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
      title: 'Log milk batch',
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: AppSpacing.page,
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FormMessage.error(_error),
                    AppTextField(controller: _code, labelText: 'Batch code', prefixIcon: Icons.qr_code),
                    const SizedBox(height: 12),
                    AppTextField(
                      controller: _date,
                      labelText: 'Collection date',
                      readOnly: true,
                      onTap: () => pickIsoDate(context, _date),
                    ),
                    const SizedBox(height: 12),
                    AppTextField(
                      controller: _qty,
                      labelText: 'Quantity (litres)',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) {
                        final n = double.tryParse(v ?? '');
                        if (n == null || n <= 0) return 'Enter a quantity greater than 0';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Text('Source animals', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        const Spacer(),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              if (_selected.length == _animals.length) {
                                _selected.clear();
                              } else {
                                _selected
                                  ..clear()
                                  ..addAll(_animals.map((a) => a.id));
                              }
                            });
                          },
                          child: const Text('Toggle all'),
                        ),
                      ],
                    ),
                    ..._animals.map(
                      (animal) => CheckboxListTile(
                        value: _selected.contains(animal.id),
                        activeColor: AppColors.primary,
                        title: Text(animal.tagNumber, style: const TextStyle(color: Colors.white)),
                        subtitle: Text(animal.species, style: const TextStyle(color: AppColors.muted)),
                        onChanged: (checked) {
                          setState(() {
                            if (checked == true) {
                              _selected.add(animal.id);
                            } else {
                              _selected.remove(animal.id);
                            }
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    CustomButton(text: 'Create batch', isLoading: _saving, onPressed: _submit),
                  ],
                ),
              ),
            ),
    );
  }
}
