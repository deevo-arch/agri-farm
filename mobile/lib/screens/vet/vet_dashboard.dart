import 'package:flutter/material.dart';
import '../../models/user.dart';
import '../auth/login_screen.dart';

class VetDashboard extends StatelessWidget {
  final User user;

  const VetDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1F2937),
        title: Text('Dr. ${user.fullName} (Vet)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          )
        ],
      ),
      body: Padding(
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
                        user.fullName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const Text('Certified Veterinary Officer', style: TextStyle(color: Colors.grey, fontSize: 13)),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '🩺 Visit Requests',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              color: const Color(0xFF1F2937),
              child: ListTile(
                leading: const Icon(Icons.pets, color: Color(0xFF10B981)),
                title: const Text('COW-101 (Green Meadows Farm)', style: TextStyle(color: Colors.white)),
                subtitle: const Text('Reason: FMD Vaccine & Health Checkup', style: TextStyle(color: Colors.grey)),
                trailing: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                  onPressed: () {},
                  child: const Text('Treat'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
