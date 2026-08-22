import 'package:flutter/material.dart';

import '../../api/treatment_api.dart';
import '../../api/vet_visit_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/vet_visit.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';
import '../../widgets/status_badge.dart';

class VisitDetailScreen extends StatefulWidget {
  const VisitDetailScreen({super.key, required this.visitId});

  final int visitId;

  @override
  State<VisitDetailScreen> createState() => _VisitDetailScreenState();
}

class _VisitDetailScreenState extends State<VisitDetailScreen> {
  VetVisit? _visit;
  bool _loading = true;
  bool _acting = false;
  String? _error;
  String _actionError = '';

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
      final visit = await VetVisitApi.getById(widget.visitId);
      if (!mounted) return;
      setState(() {
        _visit = visit;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _run(Future<VetVisit> Function() action) async {
    setState(() {
      _acting = true;
      _actionError = '';
    });
    try {
      final updated = await action();
      if (!mounted) return;
      setState(() => _visit = updated);
    } on ApiException catch (e) {
      setState(() => _actionError = e.message);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthStorage.instance.session!.toUser();
    final role = user.role.toUpperCase();
    final isVet = role == 'VET' || role == 'ADMIN';
    return RoleScaffold(
      user: user,
      title: 'Visit detail',
      body: AsyncValueWidget<VetVisit>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _visit,
        builder: (visit) => ListView(
          padding: AppSpacing.page,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    visit.livestockTagNumber,
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                StatusBadge(status: visit.status),
              ],
            ),
            const SizedBox(height: 8),
            Text(visit.farmName, style: const TextStyle(color: AppColors.muted)),
            Text('Preferred: ${formatDate(visit.preferredDate)}', style: const TextStyle(color: AppColors.muted)),
            Text('Requested by: ${visit.requestedByName}', style: const TextStyle(color: AppColors.muted)),
            if (visit.vetName != null) Text('Vet: ${visit.vetName}', style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 12),
            Text(visit.reason, style: const TextStyle(color: Colors.white)),
            if (visit.notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(visit.notes, style: const TextStyle(color: AppColors.muted)),
            ],
            const SizedBox(height: 16),
            FormMessage.error(_actionError),
            if (isVet && visit.status == 'REQUESTED') ...[
              CustomButton(
                text: 'Accept visit',
                isLoading: _acting,
                onPressed: () => _run(() => VetVisitApi.accept(visit.id)),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: _acting ? null : () => _run(() => VetVisitApi.reject(visit.id)),
                child: const Text('Reject', style: TextStyle(color: Colors.redAccent)),
              ),
            ],
            if (isVet && visit.status == 'ACCEPTED') ...[
              CustomButton(
                text: 'Mark complete',
                isLoading: _acting,
                onPressed: () => _run(() => VetVisitApi.complete(visit.id)),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () async {
                  await Navigator.pushNamed(
                    context,
                    AppRoutes.recordTreatment,
                    arguments: {
                      'livestockId': visit.livestockId,
                      'vetVisitId': visit.id,
                    },
                  );
                },
                icon: const Icon(Icons.vaccines, color: AppColors.primary),
                label: const Text('Record treatment', style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
