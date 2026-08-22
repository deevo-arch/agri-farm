import '../core/api_client.dart';
import '../core/json.dart';
import '../models/milk_batch.dart';

class MilkBatchApi {
  static Future<List<MilkBatch>> getByFarm(int farmId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/milk-batches/farm/$farmId');
    return asList(data).map((item) => MilkBatch.fromJson(asMap(item))).toList();
  }

  static Future<MilkBatch> getById(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/milk-batches/$id');
    return MilkBatch.fromJson(asMap(data));
  }

  static Future<MilkBatch> create({
    required String batchCode,
    required int farmId,
    required int collectedById,
    required String collectionDate,
    required double quantityLitres,
    required List<int> livestockIds,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/milk-batches',
      data: {
        'batchCode': batchCode,
        'farmId': farmId,
        'collectedById': collectedById,
        'collectionDate': collectionDate,
        'quantityLitres': quantityLitres,
        'livestockIds': livestockIds,
      },
    );
    return MilkBatch.fromJson(asMap(data));
  }

  static Future<QrCodeResult> generateQr(int milkBatchId) async {
    final data = await ApiClient.instance.post<dynamic>('/api/milk-batches/$milkBatchId/qr');
    return QrCodeResult.fromJson(asMap(data));
  }
}
