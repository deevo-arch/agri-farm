package com.livestock.trace.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// administeredBy is never accepted from the client — the authenticated VET is used instead.
public record MedicationCreateRequest(
        @NotNull Long livestockId,
        Long vetVisitId,
        @NotBlank String medicationName,
        String dosage,
        @NotNull LocalDate administeredDate,
        @NotNull LocalDate withdrawalEndDate) {}
