import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/auth_session.dart';

class AuthStorage {
  AuthStorage._();

  static final AuthStorage instance = AuthStorage._();

  static const _key = 'agritrust.auth';

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  AuthSession? _session;

  AuthSession? get session => _session;
  String? get token => _session?.token;
  bool get isAuthenticated => _session?.token.isNotEmpty == true;

  Future<void> load() async {
    final raw = await _storage.read(key: _key);
    if (raw == null || raw.isEmpty) {
      _session = null;
      return;
    }
    try {
      _session = AuthSession.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      _session = null;
      await _storage.delete(key: _key);
    }
  }

  Future<void> save(AuthSession session) async {
    _session = session;
    await _storage.write(key: _key, value: jsonEncode(session.toJson()));
  }

  Future<void> clear() async {
    _session = null;
    await _storage.delete(key: _key);
  }
}
