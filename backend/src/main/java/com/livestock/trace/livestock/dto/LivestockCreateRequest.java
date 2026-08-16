package com.livestock.trace.livestock.dto;

import com.livestock.trace.livestock.Species;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public record LivestockCreateRequest(
        @NotBlank String tagNumber,
        @NotNull Species species,
        @PastOrPresent LocalDate dateOfBirth,
        @NotNull Long farmId) {}
