import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../api/livestock_api.dart';
import '../../core/api_exception.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/treatment.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';

class TreatmentsScreen extends StatefulWidget {
  const TreatmentsScreen({super.key});

  @override
  State<TreatmentsScreen> createState() => _TreatmentsScreenState();
}

class _TreatmentsScreenState extends State<TreatmentsScreen> with SingleTickerProviderStateMixin {
  List<Vaccination> _vaccinations = const [];
  List<Medication> _medications = const [];
  bool _loading = true;
  String? _error;
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final farms = await FarmApi.getMine();
      if (farms.isEmpty) {
        setState(() {
          _vaccinations = const [];
          _medications = const [];
          _loading = false;
        });
        return;
      }
      final animals = await FarmApi.getLivestock(farms.first.id);
      final health = await Future.wait(animals.map((a) => LivestockApi.getHealth(a.id)));
      setState(() {
        _vaccinations = health.expand((h) => h.vaccinations).toList();
        _medications = health.expand((h) => h.medications).toList();
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: AuthStorage.instance.session!.toUser(),
      title: 'Treatments',
      body: Column(
        children: [
          TabBar(
            controller: _tabs,
            indicatorColor: AppColors.primary,
            tabs: const [Tab(text: 'Vaccinations'), Tab(text: 'Medications')],
          ),
          Expanded(
            child: AsyncValueWidget<bool>(
              isLoading: _loading,
              error: _error,
              onRetry: _load,
              data: true,
              builder: (_) => TabBarView(
                controller: _tabs,
                children: [
                  _list(
                    _vaccinations
                        .map(
                          (item) => ListTile(
                            title: Text(item.vaccineName, style: const TextStyle(color: Colors.white)),
                            subtitle: Text(
                              '${item.livestockTagNumber} • ${formatDate(item.administeredDate)}',
                              style: const TextStyle(color: AppColors.muted),
                            ),
                          ),
                        )
                        .toList(),
                    'No vaccinations recorded.',
                  ),
                  _list(
                    _medications
                        .map(
                          (item) => ListTile(
                            title: Text(item.medicationName, style: const TextStyle(color: Colors.white)),
                            subtitle: Text(
                              '${item.livestockTagNumber} • ${item.dosage} • ${formatDate(item.administeredDate)}',
                              style: const TextStyle(color: AppColors.muted),
                            ),
                          ),
                        )
                        .toList(),
                    'No medications recorded.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _list(List<Widget> tiles, String empty) {
    if (tiles.isEmpty) {
      return Center(child: Text(empty, style: const TextStyle(color: AppColors.muted)));
    }
    return ListView(children: tiles);
  }
}
