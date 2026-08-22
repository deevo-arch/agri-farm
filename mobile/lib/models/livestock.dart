import '../core/json.dart';

class Livestock {
  const Livestock({
    required this.id,
    required this.tagNumber,
    required this.species,
    required this.dateOfBirth,
    required this.status,
    required this.farmId,
    required this.farmName,
  });

  final int id;
  final String tagNumber;
  final String species;
  final String dateOfBirth;
  final String status;
  final int farmId;
  final String farmName;

  factory Livestock.fromJson(Map<String, dynamic> json) {
    return Livestock(
      id: asIntOr(json['id']),
      tagNumber: asString(json['tagNumber']),
      species: asString(json['species'], 'COW'),
      dateOfBirth: asString(json['dateOfBirth']),
      status: asString(json['status'], 'ACTIVE'),
      farmId: asIntOr(json['farmId']),
      farmName: asString(json['farmName']),
    );
  }
}
