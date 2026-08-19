import 'convert_json.dart';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/animal.dart';

class ApiService {
  // Base URL pointing to Spring Boot Backend
  static const String baseUrl = 'http://localhost:8080/api';
  static String? jwtToken;

  static Future<User?> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: convertJsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = convertJsonDecode(response.body);
      jwtToken = data['token'];
      return User.fromJson(data);
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  static Future<List<Animal>> getLivestock(int farmId) async {
    final url = Uri.parse('$baseUrl/farms/$farmId/livestock');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        if (jwtToken != null) 'Authorization': 'Bearer $jwtToken',
      },
    );

    if (response.statusCode == 200) {
      final List list = convertJsonDecode(response.body);
      return list.map((item) => Animal.fromJson(item)).toList();
    } else {
      return [];
    }
  }

  static Future<Map<String, dynamic>> verifyQrToken(String token) async {
    final url = Uri.parse('$baseUrl/public/verify/$token');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return convertJsonDecode(response.body);
    } else {
      throw Exception('Product verification failed');
    }
  }
}
