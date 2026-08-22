import '../core/api_client.dart';
import '../core/auth_storage.dart';
import '../core/json.dart';
import '../models/auth_session.dart';
import '../models/user.dart';

class AuthApi {
  static Future<AuthSession> login(String email, String password) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/auth/login',
      data: {'email': email, 'password': password},
    );
    final session = AuthSession.fromJson(asMap(data));
    await AuthStorage.instance.save(session);
    return session;
  }

  static Future<User> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/auth/register',
      data: {'fullName': fullName, 'email': email, 'password': password, 'role': 'FARMER'},
    );
    return User.fromJson(asMap(data));
  }

  static Future<void> logout() => AuthStorage.instance.clear();
}
