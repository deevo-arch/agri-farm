import '../core/api_client.dart';
import '../core/json.dart';
import '../models/livestock.dart';
import '../models/livestock_health.dart';

class LivestockApi {
  static Future<Livestock> getById(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/livestock/$id');
    return Livestock.fromJson(asMap(data));
  }

  static Future<LivestockHealth> getHealth(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/livestock/$id/health');
    return LivestockHealth.fromJson(asMap(data));
  }

  static Future<Livestock> create({
    required String tagNumber,
    required String species,
    String? dateOfBirth,
    required int farmId,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/livestock',
      data: {
        'tagNumber': tagNumber,
        'species': species,
        'dateOfBirth': (dateOfBirth == null || dateOfBirth.isEmpty) ? null : dateOfBirth,
        'farmId': farmId,
      },
    );
    return Livestock.fromJson(asMap(data));
  }

  static Future<Livestock> update(
    int id, {
    required String species,
    required String dateOfBirth,
    required String status,
  }) async {
    final data = await ApiClient.instance.patch<dynamic>(
      '/api/livestock/$id',
      data: {'species': species, 'dateOfBirth': dateOfBirth, 'status': status},
    );
    return Livestock.fromJson(asMap(data));
  }
}
