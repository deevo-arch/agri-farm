import 'package:flutter/material.dart';

import '../../api/auth_api.dart';
import '../../api/farm_api.dart';
import '../../core/app_routes.dart';
import '../../core/theme.dart';
import '../../models/farm.dart';
import '../../models/livestock.dart';
import '../../models/user.dart';
import '../../widgets/animal_card.dart';
import '../../widgets/app_drawer.dart';
import '../auth/login_screen.dart';

class FarmerDashboard extends StatefulWidget {
  final User user;

  const FarmerDashboard({super.key, required this.user});

  @override
  State<FarmerDashboard> createState() => _FarmerDashboardState();
}

class _FarmerDashboardState extends State<FarmerDashboard> {
  List<Livestock> _animals = [];
  Farm? _farm;
  bool _isLoading = true;
  String _selectedFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final farms = await FarmApi.getMine();
      final farm = farms.isNotEmpty ? farms.first : null;
      final animals =
          farm == null ? <Livestock>[] : await FarmApi.getLivestock(farm.id);
      if (!mounted) return;
      setState(() {
        _farm = farm;
        _animals = animals;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  List<Livestock> get _filteredAnimals {
    if (_selectedFilter == 'ALL') return _animals;
    return _animals
        .where((a) => a.species.toUpperCase() == _selectedFilter)
        .toList();
  }

  // ── FAB: register farm if none, otherwise add livestock ──────────────────
  Widget? _buildFab() {
    if (_isLoading) return null;
    if (_farm == null) {
      return FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_home_work),
        label: const Text('Register farm'),
        onPressed: () async {
          final created = await Navigator.pushNamed(
            context,
            AppRoutes.createFarm,
            arguments: widget.user.id,
          );
          if (created == true) _fetchData();
        },
      );
    }
    return FloatingActionButton(
      backgroundColor: AppColors.primary,
      tooltip: 'Add livestock',
      onPressed: () async {
        final created = await Navigator.pushNamed(
          context,
          AppRoutes.addLivestock,
          arguments: _farm!.id,
        );
        if (created == true) _fetchData();
      },
      child: const Icon(Icons.add),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1914),
      // ── Drawer ────────────────────────────────────────────────────────────
      drawer: AppDrawer(user: widget.user),
      appBar: AppBar(
        backgroundColor: const Color(0xFF152A22),
        elevation: 0,
        // hamburger icon is rendered automatically when drawer is set
        title: Row(
          children: [
            const CircleAvatar(
              radius: 16,
              backgroundColor: Color(0xFF10B981),
              child: Icon(Icons.person, size: 18, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.user.fullName,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Text('Verified Farmer',
                      style: TextStyle(
                          fontSize: 11, color: Color(0xFF10B981))),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Quick link to farm detail
          IconButton(
            icon: const Icon(Icons.agriculture, color: Color(0xFF10B981)),
            tooltip: 'My farm',
            onPressed: () => Navigator.pushNamed(context, AppRoutes.farmDetail),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF9CA3AF)),
            tooltip: 'Sign out',
            onPressed: () async {
              await AuthApi.logout();
              if (!context.mounted) return;
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      floatingActionButton: _buildFab(),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : RefreshIndicator(
              onRefresh: _fetchData,
              color: const Color(0xFF10B981),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Farm banner ──────────────────────────────────────
                    GestureDetector(
                      onTap: () async {
                        await Navigator.pushNamed(
                            context, AppRoutes.farmDetail);
                        _fetchData();
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Color(0xFF059669),
                              Color(0xFF10B981),
                              Color(0xFF047857),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withAlpha(80),
                              blurRadius: 15,
                              offset: const Offset(0, 8),
                            )
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Flexible(
                                  child: Text(
                                    '🏡 ${_farm?.name ?? 'No farm registered'}',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 17,
                                        fontWeight: FontWeight.bold),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withAlpha(60),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    '🟢 LIVE',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on,
                                    size: 14, color: Colors.white70),
                                const SizedBox(width: 4),
                                Flexible(
                                  child: Text(
                                    _farm?.location ??
                                        'Tap to register your farm',
                                    style: const TextStyle(
                                        color: Colors.white70, fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceAround,
                              children: [
                                _buildStatChip(
                                    'Total Head', '${_animals.length}'),
                                _buildStatChip(
                                    'Cows',
                                    '${_animals.where((a) => a.species == 'COW').length}'),
                                _buildStatChip(
                                    'Goats',
                                    '${_animals.where((a) => a.species == 'GOAT').length}'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ── Quick action row ─────────────────────────────────
                    Row(
                      children: [
                        _buildQuickAction(
                          icon: Icons.water_drop,
                          label: 'Milk batches',
                          color: const Color(0xFF3B82F6),
                          onTap: () => Navigator.pushNamed(
                              context, AppRoutes.milkBatches),
                        ),
                        const SizedBox(width: 10),
                        _buildQuickAction(
                          icon: Icons.vaccines,
                          label: 'Treatments',
                          color: const Color(0xFFF59E0B),
                          onTap: () => Navigator.pushNamed(
                              context, AppRoutes.treatments),
                        ),
                        const SizedBox(width: 10),
                        _buildQuickAction(
                          icon: Icons.local_hospital,
                          label: 'Vet visits',
                          color: const Color(0xFFEC4899),
                          onTap: () => Navigator.pushNamed(
                              context, AppRoutes.farmerVisits,
                              arguments: widget.user),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // ── Animal list header ───────────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '🐾 Registered Animals',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.bold),
                        ),
                        Row(
                          children: [
                            _buildFilterChip('ALL'),
                            const SizedBox(width: 4),
                            _buildFilterChip('COW'),
                            const SizedBox(width: 4),
                            _buildFilterChip('GOAT'),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // ── Animal list ──────────────────────────────────────
                    if (_filteredAnimals.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        child: Text(
                          _farm == null
                              ? 'Register a farm first, then add animals.'
                              : 'No animals in this category.\nTap + to add one.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.grey),
                        ),
                      )
                    else
                      ..._filteredAnimals.map(
                        (a) => AnimalCard(
                          animal: a,
                          onTap: () async {
                            await Navigator.pushNamed(
                                context, AppRoutes.livestockDetail,
                                arguments: a.id);
                            _fetchData();
                          },
                        ),
                      ),

                    // extra space so FAB doesn't cover the last card
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(40),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          Text(label,
              style:
                  const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: color.withAlpha(30),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withAlpha(80)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(label,
                  style: TextStyle(
                      color: color,
                      fontSize: 11,
                      fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String filter) {
    final isSelected = _selectedFilter == filter;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = filter),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF10B981)
              : const Color(0xFF152A22),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: isSelected
                  ? const Color(0xFF34D399)
                  : const Color(0xFF1F3F33)),
        ),
        child: Text(
          filter,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
            fontSize: 11,
            fontWeight:
                isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
