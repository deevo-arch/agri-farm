import 'package:flutter/material.dart';
import '../../models/user.dart';
import '../../models/animal.dart';
import '../../services/api_service.dart';
import '../../widgets/animal_card.dart';
import '../auth/login_screen.dart';

class FarmerDashboard extends StatefulWidget {
  final User user;

  const FarmerDashboard({super.key, required this.user});

  @override
  State<FarmerDashboard> createState() => _FarmerDashboardState();
}

class _FarmerDashboardState extends State<FarmerDashboard> {
  List<Animal> _animals = [];
  bool _isLoading = true;
  String _selectedFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _fetchLivestock();
  }

  void _fetchLivestock() async {
    try {
      final animals = await ApiService.getLivestock(1); // Primary Farm ID 1
      setState(() {
        _animals = animals;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  List<Animal> get _filteredAnimals {
    if (_selectedFilter == 'ALL') return _animals;
    return _animals.where((a) => a.species.toUpperCase() == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1914),
      appBar: AppBar(
        backgroundColor: const Color(0xFF152A22),
        elevation: 0,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 16,
              backgroundColor: Color(0xFF10B981),
              child: Icon(Icons.person, size: 18, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.user.fullName,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const Text('Verified Farmer', style: TextStyle(fontSize: 11, color: Color(0xFF10B981))),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF9CA3AF)),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : RefreshIndicator(
              onRefresh: () async => _fetchLivestock(),
              color: const Color(0xFF10B981),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Farm Banner Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF059669), Color(0xFF10B981), Color(0xFF047857)],
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                '🏡 Green Meadows Dairy',
                                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.black.withAlpha(60),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  '🟢 LIVE',
                                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Row(
                            children: [
                              Icon(Icons.location_on, size: 14, color: Colors.white70),
                              SizedBox(width: 4),
                              Text('Anand, Gujarat', style: TextStyle(color: Colors.white70, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStatChip('Total Head', '${_animals.length}'),
                              _buildStatChip('Cows', '${_animals.where((a) => a.species == 'COW').length}'),
                              _buildStatChip('Goats', '${_animals.where((a) => a.species == 'GOAT').length}'),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Quick Filter Chips
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '🐾 Registered Animals',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        Row(
                          children: [
                            _buildFilterChip('ALL'),
                            const SizedBox(width: 4),
                            _buildFilterChip('COW'),
                            const SizedBox(width: 4),
                            _buildFilterChip('GOAT'),
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Livestock List
                    if (_filteredAnimals.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        child: const Text('No animals found in this category.', style: TextStyle(color: Colors.grey)),
                      )
                    else
                      ..._filteredAnimals.map((a) => AnimalCard(animal: a)),
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
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
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
          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF152A22),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? const Color(0xFF34D399) : const Color(0xFF1F3F33)),
        ),
        child: Text(
          filter,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
