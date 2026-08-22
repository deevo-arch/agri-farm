import '../core/json.dart';

class PublicTrace {
  const PublicTrace({
    required this.verified,
    required this.traceabilityStatus,
    this.milkBatch,
    required this.livestock,
    this.farm,
    required this.vaccinations,
    required this.medications,
    this.milkSafety,
  });

  final bool verified;
  final String traceabilityStatus;
  final PublicMilkBatch? milkBatch;
  final List<PublicLivestock> livestock;
  final PublicFarm? farm;
  final List<PublicVaccination> vaccinations;
  final List<PublicMedication> medications;
  final PublicMilkSafety? milkSafety;

  factory PublicTrace.fromJson(Map<String, dynamic> json) {
    final farmJson = json['farm'];
    final batchJson = json['milkBatch'];
    final safetyJson = json['milkSafety'];
    return PublicTrace(
      verified: asBool(json['verified']),
      traceabilityStatus: asString(json['traceabilityStatus']),
      milkBatch: batchJson == null ? null : PublicMilkBatch.fromJson(asMap(batchJson)),
      livestock: asList(json['livestock']).map((item) => PublicLivestock.fromJson(asMap(item))).toList(),
      farm: farmJson == null ? null : PublicFarm.fromJson(asMap(farmJson)),
      vaccinations: asList(json['vaccinations']).map((item) => PublicVaccination.fromJson(asMap(item))).toList(),
      medications: asList(json['medications']).map((item) => PublicMedication.fromJson(asMap(item))).toList(),
      milkSafety: safetyJson == null ? null : PublicMilkSafety.fromJson(asMap(safetyJson)),
    );
  }
}

class PublicMilkBatch {
  const PublicMilkBatch({
    required this.batchCode,
    required this.collectionDate,
    required this.quantityLitres,
  });

  final String batchCode;
  final String collectionDate;
  final double quantityLitres;

  factory PublicMilkBatch.fromJson(Map<String, dynamic> json) {
    return PublicMilkBatch(
      batchCode: asString(json['batchCode']),
      collectionDate: asString(json['collectionDate']),
      quantityLitres: asDouble(json['quantityLitres']) ?? 0,
    );
  }
}

class PublicLivestock {
  const PublicLivestock({required this.tagNumber, required this.species});

  final String tagNumber;
  final String species;

  factory PublicLivestock.fromJson(Map<String, dynamic> json) {
    return PublicLivestock(
      tagNumber: asString(json['tagNumber']),
      species: asString(json['species']),
    );
  }
}

class PublicFarm {
  const PublicFarm({required this.name, required this.location});

  final String name;
  final String location;

  factory PublicFarm.fromJson(Map<String, dynamic> json) {
    return PublicFarm(
      name: asString(json['name']),
      location: asString(json['location']),
    );
  }
}

class PublicVaccination {
  const PublicVaccination({
    required this.livestockTagNumber,
    required this.vaccineName,
    required this.administeredDate,
    this.withdrawalEndDate,
    required this.vetName,
  });

  final String livestockTagNumber;
  final String vaccineName;
  final String administeredDate;
  final String? withdrawalEndDate;
  final String vetName;

  factory PublicVaccination.fromJson(Map<String, dynamic> json) {
    return PublicVaccination(
      livestockTagNumber: asString(json['livestockTagNumber']),
      vaccineName: asString(json['vaccineName']),
      administeredDate: asString(json['administeredDate']),
      withdrawalEndDate: json['withdrawalEndDate']?.toString(),
      vetName: asString(json['vetName']),
    );
  }
}

class PublicMedication {
  const PublicMedication({
    required this.livestockTagNumber,
    required this.medicationName,
    required this.administeredDate,
    this.withdrawalEndDate,
    required this.vetName,
  });

  final String livestockTagNumber;
  final String medicationName;
  final String administeredDate;
  final String? withdrawalEndDate;
  final String vetName;

  factory PublicMedication.fromJson(Map<String, dynamic> json) {
    return PublicMedication(
      livestockTagNumber: asString(json['livestockTagNumber']),
      medicationName: asString(json['medicationName']),
      administeredDate: asString(json['administeredDate']),
      withdrawalEndDate: json['withdrawalEndDate']?.toString(),
      vetName: asString(json['vetName']),
    );
  }
}

class PublicMilkSafety {
  const PublicMilkSafety({required this.eligibleAtCollection, required this.status});

  final bool eligibleAtCollection;
  final String status;

  factory PublicMilkSafety.fromJson(Map<String, dynamic> json) {
    return PublicMilkSafety(
      eligibleAtCollection: asBool(json['eligibleAtCollection']),
      status: asString(json['status']),
    );
  }
}
