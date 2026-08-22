import '../core/json.dart';

class VetVisit {
  const VetVisit({
    required this.id,
    required this.livestockId,
    required this.livestockTagNumber,
    required this.farmId,
    required this.farmName,
    required this.requestedById,
    required this.requestedByName,
    this.vetId,
    this.vetName,
    required this.preferredDate,
    required this.reason,
    required this.notes,
    required this.status,
    this.createdAt,
    this.completedAt,
  });

  final int id;
  final int livestockId;
  final String livestockTagNumber;
  final int farmId;
  final String farmName;
  final int requestedById;
  final String requestedByName;
  final int? vetId;
  final String? vetName;
  final String preferredDate;
  final String reason;
  final String notes;
  final String status;
  final String? createdAt;
  final String? completedAt;

  factory VetVisit.fromJson(Map<String, dynamic> json) {
    return VetVisit(
      id: asIntOr(json['id']),
      livestockId: asIntOr(json['livestockId']),
      livestockTagNumber: asString(json['livestockTagNumber']),
      farmId: asIntOr(json['farmId']),
      farmName: asString(json['farmName']),
      requestedById: asIntOr(json['requestedById']),
      requestedByName: asString(json['requestedByName']),
      vetId: asInt(json['vetId']),
      vetName: json['vetName']?.toString(),
      preferredDate: asString(json['preferredDate']),
      reason: asString(json['reason']),
      notes: asString(json['notes']),
      status: asString(json['status']),
      createdAt: json['createdAt']?.toString(),
      completedAt: json['completedAt']?.toString(),
    );
  }
}
