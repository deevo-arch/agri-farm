package com.livestock.trace.vet.dto;

import com.livestock.trace.vet.VetVisit;
import java.time.LocalDate;

public record VetVisitResponse(
        Long id,
        Long livestockId,
        String livestockTagNumber,
        Long vetId,
        String vetName,
        LocalDate visitDate,
        String notes) {

    public static VetVisitResponse from(VetVisit visit) {
        return new VetVisitResponse(
                visit.getId(),
                visit.getLivestock().getId(),
                visit.getLivestock().getTagNumber(),
                visit.getVet().getId(),
                visit.getVet().getFullName(),
                visit.getVisitDate(),
                visit.getNotes());
    }
}
