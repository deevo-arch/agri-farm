import 'package:flutter/material.dart';

import '../../api/vet_visit_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/user.dart';
import '../../models/vet_visit.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';
import '../../widgets/status_badge.dart';

class VisitListScreen extends StatefulWidget {
  const VisitListScreen({super.key, required this.user});

  final User user;

  @override
  State<VisitListScreen> createState() => _VisitListScreenState();
}

class _VisitListScreenState extends State<VisitListScreen> {
  List<VetVisit>? _visits;
  bool _loading = true;
  String? _error;

  bool get _isVet => widget.user.role.toUpperCase() == 'VET' || widget.user.role.toUpperCase() == 'ADMIN';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final List<VetVisit> visits;
      if (_isVet) {
        final pending = await VetVisitApi.getPending();
        final mine = await VetVisitApi.getByVet(widget.user.id);
        final ids = <int>{};
        visits = [...pending, ...mine].where((v) => ids.add(v.id)).toList();
      } else {
        visits = await VetVisitApi.getMine();
      }
      if (!mounted) return;
      setState(() {
        _visits = visits;
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
      user: widget.user,
      title: _isVet ? 'Visit queue' : 'My vet visits',
      body: AsyncValueWidget<List<VetVisit>>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _visits,
        emptyMessage: 'No vet visits found.',
        builder: (visits) {
          if (visits.isEmpty) {
            return const Center(child: Text('No vet visits found.', style: TextStyle(color: AppColors.muted)));
          }
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: _load,
            child: ListView.builder(
              padding: AppSpacing.page,
              itemCount: visits.length,
              itemBuilder: (context, index) {
                final visit = visits[index];
                return Card(
                  color: AppColors.surface,
                  child: ListTile(
                    title: Text(
                      '${visit.livestockTagNumber} • ${visit.farmName}',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${visit.reason}\n${formatDate(visit.preferredDate)}',
                      style: const TextStyle(color: AppColors.muted),
                    ),
                    isThreeLine: true,
                    trailing: StatusBadge(status: visit.status),
                    onTap: () async {
                      await Navigator.pushNamed(context, AppRoutes.visitDetail, arguments: visit.id);
                      _load();
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
