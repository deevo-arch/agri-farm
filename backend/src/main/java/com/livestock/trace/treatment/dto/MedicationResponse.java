package com.livestock.trace.treatment.dto;

import com.livestock.trace.treatment.Medication;
import java.time.LocalDate;

public record MedicationResponse(
        Long id,
        Long livestockId,
        String livestockTagNumber,
        Long vetVisitId,
        Long administeredById,
        String administeredByName,
        String medicationName,
        String dosage,
        LocalDate administeredDate,
        LocalDate withdrawalEndDate) {

    public static MedicationResponse from(Medication medication) {
        return new MedicationResponse(
                medication.getId(),
                medication.getLivestock().getId(),
                medication.getLivestock().getTagNumber(),
                medication.getVetVisit() != null ? medication.getVetVisit().getId() : null,
                medication.getAdministeredBy().getId(),
                medication.getAdministeredBy().getFullName(),
                medication.getMedicationName(),
                medication.getDosage(),
                medication.getAdministeredDate(),
                medication.getWithdrawalEndDate());
    }
}
