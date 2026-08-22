import 'package:flutter/material.dart';

String todayIsoDate() {
  final now = DateTime.now();
  return isoDate(now);
}

String isoDate(DateTime date) {
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}

String formatDate(String? raw) {
  if (raw == null || raw.isEmpty) return '—';
  final datePart = raw.length >= 10 ? raw.substring(0, 10) : raw;
  final parsed = DateTime.tryParse(datePart);
  if (parsed == null) return raw;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return '${parsed.day} ${months[parsed.month - 1]} ${parsed.year}';
}

String formatDateTime(String? raw) {
  if (raw == null || raw.isEmpty) return '—';
  final parsed = DateTime.tryParse(raw);
  if (parsed == null) return formatDate(raw);
  final local = parsed.toLocal();
  final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
  final minute = local.minute.toString().padLeft(2, '0');
  final suffix = local.hour >= 12 ? 'PM' : 'AM';
  return '${formatDate(isoDate(local))} $hour:$minute $suffix';
}

Future<void> pickIsoDate(
  BuildContext context,
  TextEditingController controller, {
  bool allowFuture = true,
}) async {
  final now = DateTime.now();
  final current = DateTime.tryParse(controller.text) ?? now;
  final picked = await showDatePicker(
    context: context,
    initialDate: current.isAfter(now) && !allowFuture ? now : current,
    firstDate: DateTime(1980),
    lastDate: allowFuture ? DateTime(now.year + 5) : now,
  );
  if (picked != null) {
    controller.text = isoDate(picked);
  }
}
