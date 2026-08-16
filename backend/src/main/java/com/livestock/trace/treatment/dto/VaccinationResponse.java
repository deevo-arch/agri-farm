package com.livestock.trace.treatment.dto;

import com.livestock.trace.treatment.Vaccination;
import java.time.LocalDate;

public record VaccinationResponse(
        Long id,
        Long livestockId,
        String livestockTagNumber,
        Long vetVisitId,
        Long administeredById,
        String administeredByName,
        String vaccineName,
        LocalDate administeredDate,
        LocalDate withdrawalEndDate) {

    public static VaccinationResponse from(Vaccination vaccination) {
        return new VaccinationResponse(
                vaccination.getId(),
                vaccination.getLivestock().getId(),
                vaccination.getLivestock().getTagNumber(),
                vaccination.getVetVisit() != null ? vaccination.getVetVisit().getId() : null,
                vaccination.getAdministeredBy().getId(),
                vaccination.getAdministeredBy().getFullName(),
                vaccination.getVaccineName(),
                vaccination.getAdministeredDate(),
                vaccination.getWithdrawalEndDate());
    }
}
