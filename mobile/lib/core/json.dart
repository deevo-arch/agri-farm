int? asInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

int asIntOr(dynamic value, [int fallback = 0]) => asInt(value) ?? fallback;

double? asDouble(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

String asString(dynamic value, [String fallback = '']) {
  if (value == null) return fallback;
  return value.toString();
}

bool asBool(dynamic value, [bool fallback = false]) {
  if (value is bool) return value;
  if (value == null) return fallback;
  final text = value.toString().toLowerCase();
  if (text == 'true') return true;
  if (text == 'false') return false;
  return fallback;
}

List<dynamic> asList(dynamic value) {
  if (value is List) return value;
  return const [];
}

Map<String, dynamic> asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return <String, dynamic>{};
}
