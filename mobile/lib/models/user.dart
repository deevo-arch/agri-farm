class User {
  final int id;
  final String fullName;
  final String email;
  final String role;

  User({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    String parsedRole = 'FARMER';
    if (json['role'] != null) {
      parsedRole = json['role'].toString().replaceAll('Role.', '');
    }

    return User(
      id: json['userId'] ?? json['id'] ?? 0,
      fullName: json['name'] ?? json['fullName'] ?? 'User',
      email: json['email'] ?? '',
      role: parsedRole,
    );
  }
}
