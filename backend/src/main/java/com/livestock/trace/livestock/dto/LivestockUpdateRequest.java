package com.livestock.trace.livestock.dto;

import com.livestock.trace.livestock.LivestockStatus;
import com.livestock.trace.livestock.Species;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

// tagNumber and farm are deliberately absent: tag identity is protected and animals aren't
// transferred between farms through this endpoint.
public record LivestockUpdateRequest(
        @NotNull Species species,
        @PastOrPresent LocalDate dateOfBirth,
        @NotNull LivestockStatus status) {}
