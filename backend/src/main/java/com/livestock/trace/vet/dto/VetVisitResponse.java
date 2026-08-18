package com.livestock.trace.vet.dto;

import com.livestock.trace.vet.VetVisit;
import com.livestock.trace.vet.VetVisitStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VetVisitResponse(
        Long id,
        Long livestockId,
        String livestockTagNumber,
        Long farmId,
        String farmName,
        Long requestedById,
        String requestedByName,
        Long vetId,
        String vetName,
        LocalDate preferredDate,
        String reason,
        String notes,
        VetVisitStatus status,
        LocalDateTime createdAt,
        LocalDateTime completedAt) {

    public static VetVisitResponse from(VetVisit visit) {
        return new VetVisitResponse(
                visit.getId(),
                visit.getLivestock().getId(),
                visit.getLivestock().getTagNumber(),
                visit.getLivestock().getFarm().getId(),
                visit.getLivestock().getFarm().getName(),
                visit.getRequestedBy().getId(),
                visit.getRequestedBy().getFullName(),
                visit.getVet() != null ? visit.getVet().getId() : null,
                visit.getVet() != null ? visit.getVet().getFullName() : null,
                visit.getPreferredDate(),
                visit.getReason(),
                visit.getNotes(),
                visit.getStatus(),
                visit.getCreatedAt(),
                visit.getCompletedAt());
    }
}
