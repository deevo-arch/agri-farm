package com.livestock.trace.milk.dto;

import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.milk.MilkBatch;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

public record MilkBatchResponse(
        Long id,
        String batchCode,
        Long farmId,
        String farmName,
        Long collectedById,
        String collectedByName,
        LocalDate collectionDate,
        BigDecimal quantityLitres,
        Set<Long> livestockIds) {

    public static MilkBatchResponse from(MilkBatch batch) {
        return new MilkBatchResponse(
                batch.getId(),
                batch.getBatchCode(),
                batch.getFarm().getId(),
                batch.getFarm().getName(),
                batch.getCollectedBy() != null ? batch.getCollectedBy().getId() : null,
                batch.getCollectedBy() != null ? batch.getCollectedBy().getFullName() : null,
                batch.getCollectionDate(),
                batch.getQuantityLitres(),
                batch.getLivestock().stream().map(Livestock::getId).collect(Collectors.toSet()));
    }
}
