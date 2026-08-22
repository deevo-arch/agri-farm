import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../api/milk_batch_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/milk_batch.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';

class MilkBatchListScreen extends StatefulWidget {
  const MilkBatchListScreen({super.key, this.farmId});

  final int? farmId;

  @override
  State<MilkBatchListScreen> createState() => _MilkBatchListScreenState();
}

class _MilkBatchListScreenState extends State<MilkBatchListScreen> {
  List<MilkBatch>? _batches;
  int? _farmId;
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
      var farmId = widget.farmId;
      if (farmId == null) {
        final farms = await FarmApi.getMine();
        farmId = farms.isEmpty ? null : farms.first.id;
      }
      if (farmId == null) {
        setState(() {
          _farmId = null;
          _batches = const [];
          _loading = false;
        });
        return;
      }
      final batches = await MilkBatchApi.getByFarm(farmId);
      if (!mounted) return;
      setState(() {
        _farmId = farmId;
        _batches = batches;
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
      title: 'Milk batches',
      floatingActionButton: _farmId == null
          ? null
          : FloatingActionButton(
              backgroundColor: AppColors.primary,
              onPressed: () async {
                final created = await Navigator.pushNamed(
                  context,
                  AppRoutes.createMilkBatch,
                  arguments: _farmId,
                );
                if (created == true) _load();
              },
              child: const Icon(Icons.add),
            ),
      body: AsyncValueWidget<List<MilkBatch>>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _batches,
        emptyMessage: _farmId == null
            ? 'Register a farm before logging milk batches.'
            : 'No milk batches yet.',
        builder: (batches) {
          if (batches.isEmpty) {
            return Center(
              child: Text(
                _farmId == null
                    ? 'Register a farm before logging milk batches.'
                    : 'No milk batches yet.',
                style: const TextStyle(color: AppColors.muted),
              ),
            );
          }
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: _load,
            child: ListView.builder(
              padding: AppSpacing.page,
              itemCount: batches.length,
              itemBuilder: (context, index) {
                final batch = batches[index];
                return Card(
                  color: AppColors.surface,
                  child: ListTile(
                    title: Text(batch.batchCode, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    subtitle: Text(
                      '${formatDate(batch.collectionDate)} • ${batch.quantityLitres} L',
                      style: const TextStyle(color: AppColors.muted),
                    ),
                    trailing: const Icon(Icons.qr_code, color: AppColors.accent),
                    onTap: () => Navigator.pushNamed(context, AppRoutes.milkBatchDetail, arguments: batch.id),
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
