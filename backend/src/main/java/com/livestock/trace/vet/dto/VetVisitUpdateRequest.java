package com.livestock.trace.vet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// Only legal while the visit is still REQUESTED — enforced in VetVisitService, not here.
public record VetVisitUpdateRequest(
        @NotNull LocalDate preferredDate, @NotBlank String reason, String notes) {}
