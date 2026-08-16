package com.livestock.trace.milk.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record MilkBatchCreateRequest(
        @NotBlank String batchCode,
        @NotNull Long farmId,
        Long collectedById,
        @NotNull LocalDate collectionDate,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantityLitres,
        @NotEmpty Set<Long> livestockIds) {}
