import '../core/api_client.dart';
import '../core/json.dart';
import '../models/user.dart';

class UserApi {
  static Future<List<User>> list() async {
    final data = await ApiClient.instance.get<dynamic>('/api/users');
    return asList(data).map((item) => User.fromJson(asMap(item))).toList();
  }

  static Future<User> getById(int id) async {
    final data = await ApiClient.instance.get<dynamic>('/api/users/$id');
    return User.fromJson(asMap(data));
  }

  static Future<User> create({
    required String fullName,
    required String email,
    required String password,
    required String role,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/users',
      data: {'fullName': fullName, 'email': email, 'password': password, 'role': role},
    );
    return User.fromJson(asMap(data));
  }

  static Future<User> updateMe({required String fullName, required String email}) async {
    final data = await ApiClient.instance.patch<dynamic>(
      '/api/users/me',
      data: {'fullName': fullName, 'email': email},
    );
    return User.fromJson(asMap(data));
  }

  static Future<User> updateUser(
    int id, {
    required String fullName,
    required String email,
    required String role,
  }) async {
    final data = await ApiClient.instance.put<dynamic>(
      '/api/users/$id',
      data: {'fullName': fullName, 'email': email, 'role': role},
    );
    return User.fromJson(asMap(data));
  }
}
