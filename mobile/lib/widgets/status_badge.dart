import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final isSuccess = status == 'ACTIVE' || status == 'COMPLETED' || status == 'SAFE';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isSuccess ? Colors.green.withAlpha(40) : Colors.orange.withAlpha(40),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSuccess ? Colors.green : Colors.orange),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: isSuccess ? Colors.green : Colors.orange,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}
