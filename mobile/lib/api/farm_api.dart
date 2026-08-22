import '../core/api_client.dart';
import '../core/json.dart';
import '../models/farm.dart';
import '../models/livestock.dart';

class FarmApi {
  static Future<List<Farm>> getMine() async {
    final data = await ApiClient.instance.get<dynamic>('/api/farms/mine');
    return asList(data).map((item) => Farm.fromJson(asMap(item))).toList();
  }

  static Future<Farm> getById(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/farms/$id');
    return Farm.fromJson(asMap(data));
  }

  static Future<List<Livestock>> getLivestock(int farmId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/farms/$farmId/livestock');
    return asList(data).map((item) => Livestock.fromJson(asMap(item))).toList();
  }

  static Future<Farm> create({
    required String name,
    required String location,
    required int ownerId,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/farms',
      data: {'name': name, 'location': location, 'ownerId': ownerId},
    );
    return Farm.fromJson(asMap(data));
  }

  static Future<Farm> update(int id, {required String name, required String location}) async {
    final data = await ApiClient.instance.patch<dynamic>(
      '/api/farms/$id',
      data: {'name': name, 'location': location},
    );
    return Farm.fromJson(asMap(data));
  }
}
