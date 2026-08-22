import '../core/json.dart';

class User {
  const User({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
  });

  final int id;
  final String fullName;
  final String email;
  final String role;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: asIntOr(json['id'] ?? json['userId']),
      fullName: asString(json['fullName'] ?? json['name'], 'User'),
      email: asString(json['email']),
      role: asString(json['role'], 'FARMER').replaceAll('Role.', ''),
    );
  }

  User copyWith({
    int? id,
    String? fullName,
    String? email,
    String? role,
  }) {
    return User(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      role: role ?? this.role,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'email': email,
        'role': role,
      };
}
