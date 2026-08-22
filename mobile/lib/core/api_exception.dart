import 'package:dio/dio.dart';

class ApiException implements Exception {
  ApiException({required this.message, this.statusCode});

  final String message;
  final int? statusCode;

  factory ApiException.fromDio(DioException error) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? backendMessage;
    if (data is Map) {
      backendMessage = data['message']?.toString() ?? data['detail']?.toString();
    }

    if (status == 403) {
      return ApiException(
        message: "You don't have permission to perform this action.",
        statusCode: status,
      );
    }
    if (status == 404) {
      return ApiException(
        message: backendMessage ?? 'The requested item could not be found.',
        statusCode: status,
      );
    }
    if (status == 409) {
      return ApiException(
        message: backendMessage ?? 'This action conflicts with existing data.',
        statusCode: status,
      );
    }
    if (status != null && status >= 500) {
      return ApiException(message: 'Something went wrong. Please try again.', statusCode: status);
    }
    if (backendMessage != null && backendMessage.isNotEmpty) {
      return ApiException(message: backendMessage, statusCode: status);
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return ApiException(message: 'Unable to reach the server. Please try again.', statusCode: status);
    }
    return ApiException(message: 'Something went wrong. Please try again.', statusCode: status);
  }

  @override
  String toString() => message;
}
