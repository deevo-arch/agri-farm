import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final tone = _toneFor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: tone.withAlpha(40),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: tone),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: tone,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Color _toneFor(String raw) {
    switch (raw.toUpperCase()) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'SAFE':
      case 'ACCEPTED':
      case 'VERIFIED':
        return Colors.green;
      case 'REJECTED':
      case 'DECEASED':
      case 'UNSAFE':
        return Colors.redAccent;
      case 'SOLD':
        return const Color(0xFF9CA3AF);
      default:
        return const Color(0xFFF59E0B);
    }
  }
}
