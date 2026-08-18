package com.livestock.trace.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// administeredBy is never accepted from the client — the authenticated VET is used instead.
public record VaccinationCreateRequest(
        @NotNull Long livestockId,
        Long vetVisitId,
        @NotBlank String vaccineName,
        @NotNull LocalDate administeredDate,
        @NotNull LocalDate withdrawalEndDate) {}
