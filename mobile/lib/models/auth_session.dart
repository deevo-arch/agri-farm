import '../core/json.dart';
import 'user.dart';

class AuthSession {
  const AuthSession({
    required this.token,
    required this.tokenType,
    required this.userId,
    required this.name,
    required this.role,
  });

  final String token;
  final String tokenType;
  final int userId;
  final String name;
  final String role;

  User toUser({String email = ''}) =>
      User(id: userId, fullName: name, email: email, role: role);

  AuthSession copyWith({
    String? token,
    String? tokenType,
    int? userId,
    String? name,
    String? role,
  }) {
    return AuthSession(
      token: token ?? this.token,
      tokenType: tokenType ?? this.tokenType,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      role: role ?? this.role,
    );
  }

  Map<String, dynamic> toJson() => {
        'token': token,
        'tokenType': tokenType,
        'userId': userId,
        'name': name,
        'role': role,
      };

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: asString(json['token']),
      tokenType: asString(json['tokenType'], 'Bearer'),
      userId: asIntOr(json['userId'] ?? json['id']),
      name: asString(json['name'] ?? json['fullName'], 'User'),
      role: asString(json['role'], 'FARMER').replaceAll('Role.', ''),
    );
  }
}
