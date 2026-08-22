import '../core/json.dart';

class MilkBatch {
  const MilkBatch({
    required this.id,
    required this.batchCode,
    required this.farmId,
    required this.farmName,
    this.collectedById,
    this.collectedByName,
    required this.collectionDate,
    required this.quantityLitres,
    required this.livestockIds,
  });

  final int id;
  final String batchCode;
  final int farmId;
  final String farmName;
  final int? collectedById;
  final String? collectedByName;
  final String collectionDate;
  final double quantityLitres;
  final List<int> livestockIds;

  factory MilkBatch.fromJson(Map<String, dynamic> json) {
    return MilkBatch(
      id: asIntOr(json['id']),
      batchCode: asString(json['batchCode']),
      farmId: asIntOr(json['farmId']),
      farmName: asString(json['farmName']),
      collectedById: asInt(json['collectedById']),
      collectedByName: json['collectedByName']?.toString(),
      collectionDate: asString(json['collectionDate']),
      quantityLitres: asDouble(json['quantityLitres']) ?? 0,
      livestockIds: asList(json['livestockIds']).map((id) => asIntOr(id)).toList(),
    );
  }
}

class QrCodeResult {
  const QrCodeResult({
    required this.qrId,
    required this.milkBatchId,
    required this.token,
    required this.traceUrl,
    required this.qrImage,
  });

  final int qrId;
  final int milkBatchId;
  final String token;
  final String traceUrl;
  final String qrImage;

  factory QrCodeResult.fromJson(Map<String, dynamic> json) {
    return QrCodeResult(
      qrId: asIntOr(json['qrId']),
      milkBatchId: asIntOr(json['milkBatchId']),
      token: asString(json['token']),
      traceUrl: asString(json['traceUrl']),
      qrImage: asString(json['qrImage']),
    );
  }
}
