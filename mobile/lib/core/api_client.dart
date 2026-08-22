import 'package:dio/dio.dart';
import 'package:flutter/scheduler.dart';

import 'api_config.dart';
import 'api_exception.dart';
import 'app_navigator.dart';
import 'app_routes.dart';
import 'auth_storage.dart';

class ApiClient {
  ApiClient._(this._dio);

  final Dio _dio;

  static ApiClient? _instance;

  static ApiClient get instance {
    final existing = _instance;
    if (existing == null) {
      throw StateError('ApiClient.initialize() must be called before use.');
    }
    return existing;
  }

  static void initialize() {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: const {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    dio.interceptors.add(AuthInterceptor());
    _instance = ApiClient._(dio);
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? query}) async {
    try {
      final response = await _dio.get<T>(path, queryParameters: query);
      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<T> post<T>(String path, {Object? data}) async {
    try {
      final response = await _dio.post<T>(path, data: data);
      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<T> put<T>(String path, {Object? data}) async {
    try {
      final response = await _dio.put<T>(path, data: data);
      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<T> patch<T>(String path, {Object? data}) async {
    try {
      final response = await _dio.patch<T>(path, data: data);
      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }
}

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final path = options.path;
    final isPublic = path.contains('/api/public/');
    final token = AuthStorage.instance.token;
    if (!isPublic && token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final status = err.response?.statusCode;
    final path = err.requestOptions.path;
    final isAuthEndpoint = path.contains('/api/auth/');
    if (status == 401 && !isAuthEndpoint) {
      AuthStorage.instance.clear();
      SchedulerBinding.instance.addPostFrameCallback((_) {
        final navigator = AppNavigator.key.currentState;
        navigator?.pushNamedAndRemoveUntil(AppRoutes.login, (_) => false);
      });
    }
    handler.next(err);
  }
}
