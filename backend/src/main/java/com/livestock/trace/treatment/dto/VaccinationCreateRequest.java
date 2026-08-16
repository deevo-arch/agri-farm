package com.livestock.trace.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record VaccinationCreateRequest(
        @NotNull Long livestockId,
        Long vetVisitId,
        @NotNull Long administeredById,
        @NotBlank String vaccineName,
        @NotNull LocalDate administeredDate,
        @NotNull LocalDate withdrawalEndDate) {}
