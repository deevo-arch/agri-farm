import 'package:flutter/material.dart';

import '../../api/vet_visit_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/user.dart';
import '../../models/vet_visit.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';
import '../../widgets/status_badge.dart';

class VetDashboard extends StatefulWidget {
  final User user;

  const VetDashboard({super.key, required this.user});

  @override
  State<VetDashboard> createState() => _VetDashboardState();
}

class _VetDashboardState extends State<VetDashboard> {
  List<VetVisit>? _visits;
  bool _loading = true;
  String? _error;

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
      final visits = await VetVisitApi.getPending();
      if (!mounted) return;
      setState(() {
        _visits = visits.take(5).toList();
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
      title: 'Dr. ${widget.user.fullName}',
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1F2937),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFF10B981),
                    child: Icon(Icons.medical_services, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.user.fullName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const Text('Certified Veterinary Officer', style: TextStyle(color: Colors.grey, fontSize: 13)),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '🩺 Recent Requests',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.vetVisits),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            AsyncValueWidget<List<VetVisit>>(
              isLoading: _loading,
              error: _error,
              onRetry: _load,
              data: _visits,
              emptyMessage: 'No pending visit requests.',
              builder: (visits) {
                if (visits.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('No pending requests.', style: TextStyle(color: AppColors.muted)),
                    ),
                  );
                }
                return Column(
                  children: visits.map((visit) => Card(
                    color: const Color(0xFF1F2937),
                    child: ListTile(
                      leading: const Icon(Icons.pets, color: Color(0xFF10B981)),
                      title: Text(
                        '${visit.livestockTagNumber} (${visit.farmName})', 
                        style: const TextStyle(color: Colors.white)
                      ),
                      subtitle: Text(
                        'Reason: ${visit.reason}\nDate: ${formatDate(visit.preferredDate)}', 
                        style: const TextStyle(color: Colors.grey)
                      ),
                      isThreeLine: true,
                      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                      onTap: () async {
                        await Navigator.pushNamed(context, AppRoutes.visitDetail, arguments: visit.id);
                        _load();
                      },
                    ),
                  )).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
