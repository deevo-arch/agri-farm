import '../core/json.dart';

class Vaccination {
  const Vaccination({
    required this.id,
    required this.livestockId,
    required this.livestockTagNumber,
    this.vetVisitId,
    required this.administeredById,
    required this.administeredByName,
    required this.vaccineName,
    required this.administeredDate,
    this.withdrawalEndDate,
  });

  final int id;
  final int livestockId;
  final String livestockTagNumber;
  final int? vetVisitId;
  final int administeredById;
  final String administeredByName;
  final String vaccineName;
  final String administeredDate;
  final String? withdrawalEndDate;

  factory Vaccination.fromJson(Map<String, dynamic> json) {
    return Vaccination(
      id: asIntOr(json['id']),
      livestockId: asIntOr(json['livestockId']),
      livestockTagNumber: asString(json['livestockTagNumber']),
      vetVisitId: asInt(json['vetVisitId']),
      administeredById: asIntOr(json['administeredById']),
      administeredByName: asString(json['administeredByName']),
      vaccineName: asString(json['vaccineName']),
      administeredDate: asString(json['administeredDate']),
      withdrawalEndDate: json['withdrawalEndDate']?.toString(),
    );
  }
}

class Medication {
  const Medication({
    required this.id,
    required this.livestockId,
    required this.livestockTagNumber,
    this.vetVisitId,
    required this.administeredById,
    required this.administeredByName,
    required this.medicationName,
    required this.dosage,
    required this.administeredDate,
    this.withdrawalEndDate,
  });

  final int id;
  final int livestockId;
  final String livestockTagNumber;
  final int? vetVisitId;
  final int administeredById;
  final String administeredByName;
  final String medicationName;
  final String dosage;
  final String administeredDate;
  final String? withdrawalEndDate;

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: asIntOr(json['id']),
      livestockId: asIntOr(json['livestockId']),
      livestockTagNumber: asString(json['livestockTagNumber']),
      vetVisitId: asInt(json['vetVisitId']),
      administeredById: asIntOr(json['administeredById']),
      administeredByName: asString(json['administeredByName']),
      medicationName: asString(json['medicationName']),
      dosage: asString(json['dosage']),
      administeredDate: asString(json['administeredDate']),
      withdrawalEndDate: json['withdrawalEndDate']?.toString(),
    );
  }
}
