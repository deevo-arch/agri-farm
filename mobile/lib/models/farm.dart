import '../core/json.dart';

class Farm {
  const Farm({
    required this.id,
    required this.name,
    required this.location,
    required this.ownerId,
    required this.ownerName,
  });

  final int id;
  final String name;
  final String location;
  final int ownerId;
  final String ownerName;

  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: asIntOr(json['id']),
      name: asString(json['name']),
      location: asString(json['location']),
      ownerId: asIntOr(json['ownerId']),
      ownerName: asString(json['ownerName']),
    );
  }
}
