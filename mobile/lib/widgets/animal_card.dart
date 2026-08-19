import 'package:flutter/material.dart';
import '../models/animal.dart';
import 'status_badge.dart';

class AnimalCard extends StatelessWidget {
  final Animal animal;
  final VoidCallback? onTap;

  const AnimalCard({super.key, required this.animal, this.onTap});

  String _getSpeciesEmoji(String species) {
    switch (species.toUpperCase()) {
      case 'GOAT':
        return '🐐';
      case 'BUFFALO':
        return '🦬';
      case 'SHEEP':
        return '🐑';
      default:
        return '🐄';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: const Color(0xFF1F2937),
      elevation: 3,
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          radius: 24,
          backgroundColor: const Color(0xFF10B981).withAlpha(50),
          child: Text(
            _getSpeciesEmoji(animal.species),
            style: const TextStyle(fontSize: 24),
          ),
        ),
        title: Text(
          animal.tagNumber,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(
          'Species: ${animal.species} • DOB: ${animal.dateOfBirth}',
          style: const TextStyle(color: Colors.grey, fontSize: 13),
        ),
        trailing: StatusBadge(status: animal.status),
      ),
    );
  }
}
