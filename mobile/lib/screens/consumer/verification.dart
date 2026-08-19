import 'package:flutter/material.dart';

class ConsumerVerificationScreen extends StatelessWidget {
  final String token;

  const ConsumerVerificationScreen({super.key, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1F2937),
        title: const Text('Product Food Safety Certificate'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1F2937),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF10B981), width: 2),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Color(0xFF10B981),
                    child: Icon(Icons.verified, size: 44, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'AUTHENTIC & SAFE',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const Text(
                    'Zero Antibiotics • Vet Certified',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: Colors.grey),
                  const SizedBox(height: 16),

                  _buildInfoRow('Farm Origin', 'Green Meadows Dairy Farm'),
                  _buildInfoRow('Location', 'Anand, Gujarat'),
                  _buildInfoRow('Source Animal', 'COW-101 (Holstein)'),
                  _buildInfoRow('Vet Clearance', 'Dr. Ananya (Verified)'),
                  _buildInfoRow('Token', token),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
