import '../core/json.dart';
import 'livestock.dart';
import 'treatment.dart';
import 'vet_visit.dart';

class LivestockHealth {
  const LivestockHealth({
    required this.livestock,
    required this.vetVisits,
    required this.vaccinations,
    required this.medications,
    required this.underActiveWithdrawal,
  });

  final Livestock livestock;
  final List<VetVisit> vetVisits;
  final List<Vaccination> vaccinations;
  final List<Medication> medications;
  final bool underActiveWithdrawal;

  factory LivestockHealth.fromJson(Map<String, dynamic> json) {
    return LivestockHealth(
      livestock: Livestock.fromJson(asMap(json['livestock'])),
      vetVisits: asList(json['vetVisits']).map((item) => VetVisit.fromJson(asMap(item))).toList(),
      vaccinations: asList(json['vaccinations']).map((item) => Vaccination.fromJson(asMap(item))).toList(),
      medications: asList(json['medications']).map((item) => Medication.fromJson(asMap(item))).toList(),
      underActiveWithdrawal: asBool(json['underActiveWithdrawal']),
    );
  }
}
