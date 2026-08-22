import '../core/api_client.dart';
import '../core/json.dart';
import '../models/public_trace.dart';

class PublicTraceApi {
  static Future<PublicTrace> getTrace(String token) async {
    final encoded = Uri.encodeComponent(token);
    final data = await ApiClient.instance.get<dynamic>('/api/public/trace/$encoded');
    return PublicTrace.fromJson(asMap(data));
  }
}
