package com.livestock.trace.vet.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record VetVisitCreateRequest(
        @NotNull Long livestockId,
        @NotNull Long vetId,
        @NotNull LocalDate visitDate,
        String notes) {}
