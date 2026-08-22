import 'package:flutter/material.dart';

import '../core/theme.dart';

class FormMessage extends StatelessWidget {
  const FormMessage.success(this.message, {super.key}) : isError = false;
  const FormMessage.error(this.message, {super.key}) : isError = true;

  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    if (message.isEmpty) return const SizedBox.shrink();
    final color = isError ? Colors.redAccent : AppColors.primary;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withAlpha(40),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color),
      ),
      child: Text(message, style: TextStyle(color: color, fontSize: 13)),
    );
  }
}
