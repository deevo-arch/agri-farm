package com.livestock.trace.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MedicationCreateRequest(
        @NotNull Long livestockId,
        Long vetVisitId,
        @NotNull Long administeredById,
        @NotBlank String medicationName,
        String dosage,
        @NotNull LocalDate administeredDate,
        @NotNull LocalDate withdrawalEndDate) {}
