import '../core/api_client.dart';
import '../core/json.dart';
import '../models/vet_visit.dart';

class VetVisitApi {
  static Future<List<VetVisit>> getMine() async {
    final data = await ApiClient.instance.get<dynamic>('/api/vet-visits/mine');
    return asList(data).map((item) => VetVisit.fromJson(asMap(item))).toList();
  }

  static Future<List<VetVisit>> getPending() async {
    final data = await ApiClient.instance.get<dynamic>('/api/vet-visits/pending');
    return asList(data).map((item) => VetVisit.fromJson(asMap(item))).toList();
  }

  static Future<VetVisit> getById(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/vet-visits/$id');
    return VetVisit.fromJson(asMap(data));
  }

  static Future<List<VetVisit>> getByVet(int vetId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/vet-visits/vet/$vetId');
    return asList(data).map((item) => VetVisit.fromJson(asMap(item))).toList();
  }

  static Future<List<VetVisit>> getByLivestock(int livestockId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/vet-visits/livestock/$livestockId');
    return asList(data).map((item) => VetVisit.fromJson(asMap(item))).toList();
  }

  static Future<VetVisit> request({
    required int livestockId,
    required String preferredDate,
    required String reason,
    String notes = '',
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/vet-visits',
      data: {
        'livestockId': livestockId,
        'preferredDate': preferredDate,
        'reason': reason,
        'notes': notes,
      },
    );
    return VetVisit.fromJson(asMap(data));
  }

  static Future<VetVisit> update(
    int id, {
    required String preferredDate,
    required String reason,
    required String notes,
  }) async {
    final data = await ApiClient.instance.put<dynamic>(
      '/api/vet-visits/$id',
      data: {'preferredDate': preferredDate, 'reason': reason, 'notes': notes},
    );
    return VetVisit.fromJson(asMap(data));
  }

  static Future<VetVisit> accept(int id) async {
    final data = await ApiClient.instance.post<dynamic>('/api/vet-visits/$id/accept');
    return VetVisit.fromJson(asMap(data));
  }

  static Future<VetVisit> reject(int id) async {
    final data = await ApiClient.instance.post<dynamic>('/api/vet-visits/$id/reject');
    return VetVisit.fromJson(asMap(data));
  }

  static Future<VetVisit> complete(int id) async {
    final data = await ApiClient.instance.post<dynamic>('/api/vet-visits/$id/complete');
    return VetVisit.fromJson(asMap(data));
  }
}
