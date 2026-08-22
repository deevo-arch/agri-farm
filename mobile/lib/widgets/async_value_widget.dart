import 'package:flutter/material.dart';

/// Generic async state widget — handles loading spinner, error with retry, and empty state.
class AsyncValueWidget<T> extends StatelessWidget {
  final bool isLoading;
  final String? error;
  final T? data;
  final VoidCallback? onRetry;
  final Widget Function(T data) builder;
  final String emptyMessage;

  const AsyncValueWidget({
    super.key,
    required this.isLoading,
    this.error,
    this.data,
    this.onRetry,
    required this.builder,
    this.emptyMessage = 'No data found.',
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(color: Color(0xFF10B981)),
        ),
      );
    }

    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
              const SizedBox(height: 12),
              Text(
                error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.redAccent, fontSize: 14),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh, color: Color(0xFF10B981)),
                  label: const Text('Retry', style: TextStyle(color: Color(0xFF10B981))),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF10B981)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }

    if (data == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.inbox_outlined, color: Color(0xFF9CA3AF), size: 48),
              const SizedBox(height: 12),
              Text(
                emptyMessage,
                style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return builder(data as T);
  }
}
