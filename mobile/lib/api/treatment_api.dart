import '../core/api_client.dart';
import '../core/json.dart';
import '../models/treatment.dart';

class TreatmentApi {
  static Future<List<Vaccination>> getVaccinations(int livestockId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/vaccinations/livestock/$livestockId');
    return asList(data).map((item) => Vaccination.fromJson(asMap(item))).toList();
  }

  static Future<List<Medication>> getMedications(int livestockId) async {
    final data = await ApiClient.instance.get<dynamic>('/api/medications/livestock/$livestockId');
    return asList(data).map((item) => Medication.fromJson(asMap(item))).toList();
  }

  static Future<Vaccination> createVaccination({
    required int livestockId,
    int? vetVisitId,
    required String vaccineName,
    required String administeredDate,
    String? withdrawalEndDate,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/vaccinations',
      data: {
        'livestockId': livestockId,
        'vetVisitId': vetVisitId,
        'vaccineName': vaccineName,
        'administeredDate': administeredDate,
        'withdrawalEndDate': withdrawalEndDate,
      },
    );
    return Vaccination.fromJson(asMap(data));
  }

  static Future<Medication> createMedication({
    required int livestockId,
    int? vetVisitId,
    required String medicationName,
    required String dosage,
    required String administeredDate,
    String? withdrawalEndDate,
  }) async {
    final data = await ApiClient.instance.post<dynamic>(
      '/api/medications',
      data: {
        'livestockId': livestockId,
        'vetVisitId': vetVisitId,
        'medicationName': medicationName,
        'dosage': dosage,
        'administeredDate': administeredDate,
        'withdrawalEndDate': withdrawalEndDate,
      },
    );
    return Medication.fromJson(asMap(data));
  }
}
