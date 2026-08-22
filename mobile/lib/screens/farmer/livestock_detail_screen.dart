import 'package:flutter/material.dart';

import '../../api/livestock_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/livestock_health.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';
import '../../widgets/status_badge.dart';

class LivestockDetailScreen extends StatefulWidget {
  const LivestockDetailScreen({super.key, required this.livestockId});

  final int livestockId;

  @override
  State<LivestockDetailScreen> createState() => _LivestockDetailScreenState();
}

class _LivestockDetailScreenState extends State<LivestockDetailScreen> with SingleTickerProviderStateMixin {
  LivestockHealth? _health;
  bool _loading = true;
  String? _error;
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
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
      final health = await LivestockApi.getHealth(widget.livestockId);
      if (!mounted) return;
      setState(() {
        _health = health;
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
    final user = AuthStorage.instance.session!.toUser();
    final health = _health;
    return RoleScaffold(
      user: user,
      title: health?.livestock.tagNumber ?? 'Livestock',
      actions: [
        if (health != null)
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final changed = await Navigator.pushNamed(
                context,
                AppRoutes.editLivestock,
                arguments: health.livestock,
              );
              if (changed == true) _load();
            },
          ),
      ],
      body: AsyncValueWidget<LivestockHealth>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: health,
        builder: (value) => Column(
          children: [
            Padding(
              padding: AppSpacing.page,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${value.livestock.species} • ${value.livestock.farmName}',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                      StatusBadge(status: value.livestock.status),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('DOB: ${formatDate(value.livestock.dateOfBirth)}', style: const TextStyle(color: AppColors.muted)),
                  if (value.underActiveWithdrawal) ...[
                    const SizedBox(height: 8),
                    const StatusBadge(status: 'WITHDRAWAL ACTIVE'),
                  ],
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () async {
                      await Navigator.pushNamed(
                        context,
                        AppRoutes.requestVetVisit,
                        arguments: value.livestock.id,
                      );
                      _load();
                    },
                    icon: const Icon(Icons.local_hospital, color: AppColors.primary),
                    label: const Text('Request vet visit', style: TextStyle(color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            TabBar(
              controller: _tabs,
              indicatorColor: AppColors.primary,
              tabs: const [
                Tab(text: 'Health'),
                Tab(text: 'Visits'),
                Tab(text: 'Treatments'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabs,
                children: [
                  _HealthTab(health: value),
                  _VisitsTab(health: value, onOpen: (id) async {
                    await Navigator.pushNamed(context, AppRoutes.visitDetail, arguments: id);
                    _load();
                  }),
                  _TreatmentsTab(health: value),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HealthTab extends StatelessWidget {
  const _HealthTab({required this.health});
  final LivestockHealth health;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: AppSpacing.page,
      children: [
        _tile('Vaccinations', '${health.vaccinations.length}'),
        _tile('Medications', '${health.medications.length}'),
        _tile('Vet visits', '${health.vetVisits.length}'),
        _tile('Withdrawal', health.underActiveWithdrawal ? 'Active' : 'Clear'),
      ],
    );
  }

  Widget _tile(String label, String value) {
    return ListTile(
      title: Text(label, style: const TextStyle(color: Colors.white)),
      trailing: Text(value, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
    );
  }
}

class _VisitsTab extends StatelessWidget {
  const _VisitsTab({required this.health, required this.onOpen});
  final LivestockHealth health;
  final Future<void> Function(int id) onOpen;

  @override
  Widget build(BuildContext context) {
    if (health.vetVisits.isEmpty) {
      return const Center(child: Text('No vet visits yet.', style: TextStyle(color: AppColors.muted)));
    }
    return ListView(
      children: health.vetVisits
          .map(
            (visit) => ListTile(
              title: Text(visit.reason, style: const TextStyle(color: Colors.white)),
              subtitle: Text('${formatDate(visit.preferredDate)} • ${visit.status}', style: const TextStyle(color: AppColors.muted)),
              trailing: const Icon(Icons.chevron_right, color: AppColors.muted),
              onTap: () => onOpen(visit.id),
            ),
          )
          .toList(),
    );
  }
}

class _TreatmentsTab extends StatelessWidget {
  const _TreatmentsTab({required this.health});
  final LivestockHealth health;

  @override
  Widget build(BuildContext context) {
    if (health.vaccinations.isEmpty && health.medications.isEmpty) {
      return const Center(child: Text('No treatments recorded.', style: TextStyle(color: AppColors.muted)));
    }
    return ListView(
      padding: AppSpacing.page,
      children: [
        ...health.vaccinations.map(
          (item) => ListTile(
            leading: const Icon(Icons.vaccines, color: AppColors.primary),
            title: Text(item.vaccineName, style: const TextStyle(color: Colors.white)),
            subtitle: Text(
              '${formatDate(item.administeredDate)} • ${item.administeredByName}',
              style: const TextStyle(color: AppColors.muted),
            ),
          ),
        ),
        ...health.medications.map(
          (item) => ListTile(
            leading: const Icon(Icons.medication, color: AppColors.accent),
            title: Text('${item.medicationName} (${item.dosage})', style: const TextStyle(color: Colors.white)),
            subtitle: Text(
              '${formatDate(item.administeredDate)} • ${item.administeredByName}',
              style: const TextStyle(color: AppColors.muted),
            ),
          ),
        ),
      ],
    );
  }
}
