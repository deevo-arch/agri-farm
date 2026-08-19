class Animal {
  final int id;
  final String tagNumber;
  final String species;
  final String dateOfBirth;
  final String status;

  Animal({
    required this.id,
    required this.tagNumber,
    required this.species,
    required this.dateOfBirth,
    required this.status,
  });

  factory Animal.fromJson(Map<String, dynamic> json) {
    return Animal(
      id: json['id'] ?? 0,
      tagNumber: json['tagNumber'] ?? '',
      species: json['species'] ?? 'COW',
      dateOfBirth: json['dateOfBirth'] ?? '',
      status: json['status'] ?? 'ACTIVE',
    );
  }
}
