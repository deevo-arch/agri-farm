import 'package:flutter/material.dart';

import '../../api/farm_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/theme.dart';
import '../../models/farm.dart';
import '../../models/livestock.dart';
import '../../widgets/animal_card.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/role_scaffold.dart';

class FarmDetailScreen extends StatefulWidget {
  const FarmDetailScreen({super.key, this.farmId});

  final int? farmId;

  @override
  State<FarmDetailScreen> createState() => _FarmDetailScreenState();
}

class _FarmDetailScreenState extends State<FarmDetailScreen> {
  Farm? _farm;
  List<Livestock> _animals = const [];
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
      Farm farm;
      if (widget.farmId != null) {
        farm = await FarmApi.getById(widget.farmId!);
      } else {
        final mines = await FarmApi.getMine();
        if (mines.isEmpty) {
          if (!mounted) return;
          setState(() {
            _farm = null;
            _animals = const [];
            _loading = false;
          });
          return;
        }
        farm = mines.first;
      }
      final animals = await FarmApi.getLivestock(farm.id);
      if (!mounted) return;
      setState(() {
        _farm = farm;
        _animals = animals;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Unable to load farm.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthStorage.instance.session!.toUser();
    final farm = _farm;
    return RoleScaffold(
      user: user,
      title: farm?.name ?? 'My farm',
      actions: [
        if (farm != null)
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final changed = await Navigator.pushNamed(context, AppRoutes.editFarm, arguments: farm);
              if (changed == true) _load();
            },
          ),
      ],
      floatingActionButton: farm == null
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.primary,
              onPressed: () async {
                final created = await Navigator.pushNamed(context, AppRoutes.createFarm, arguments: user.id);
                if (created == true) _load();
              },
              label: const Text('Register farm'),
              icon: const Icon(Icons.add),
            )
          : FloatingActionButton(
              backgroundColor: AppColors.primary,
              onPressed: () async {
                final created = await Navigator.pushNamed(context, AppRoutes.addLivestock, arguments: farm.id);
                if (created == true) _load();
              },
              child: const Icon(Icons.add),
            ),
      body: AsyncValueWidget<Farm>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: farm,
        emptyMessage: 'No farm registered yet. Create one to start adding livestock.',
        builder: (value) => RefreshIndicator(
          color: AppColors.primary,
          onRefresh: _load,
          child: ListView(
            padding: AppSpacing.page,
            children: [
              Text(value.location, style: const TextStyle(color: AppColors.muted)),
              const SizedBox(height: 8),
              Text('Owner: ${value.ownerName}', style: const TextStyle(color: AppColors.muted)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${_animals.length} animals', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.milkBatches, arguments: value.id),
                    child: const Text('Milk batches'),
                  ),
                ],
              ),
              if (_animals.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 32),
                  child: Text('No livestock on this farm yet.', style: TextStyle(color: AppColors.muted)),
                )
              else
                ..._animals.map(
                  (animal) => AnimalCard(
                    animal: animal,
                    onTap: () => Navigator.pushNamed(context, AppRoutes.livestockDetail, arguments: animal.id),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
