package com.livestock.trace.vet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// Only what the requesting farmer is allowed to supply. requestedBy/vet/status are server-controlled.
public record VetVisitCreateRequest(
        @NotNull Long livestockId,
        @NotNull LocalDate preferredDate,
        @NotBlank String reason,
        String notes) {}
