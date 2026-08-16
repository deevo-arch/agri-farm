package com.livestock.trace.publicapi.dto;

import com.livestock.trace.livestock.Species;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PublicTraceResponse(
        boolean verified,
        String traceabilityStatus,
        MilkBatchInfo milkBatch,
        List<LivestockInfo> livestock,
        FarmInfo farm,
        List<VaccinationInfo> vaccinations,
        List<MedicationInfo> medications,
        MilkSafety milkSafety) {

    public record MilkBatchInfo(String batchCode, LocalDate collectionDate, BigDecimal quantityLitres) {}

    public record LivestockInfo(String tagNumber, Species species) {}

    public record FarmInfo(String name, String location) {}

    public record VaccinationInfo(
            String livestockTagNumber,
            String vaccineName,
            LocalDate administeredDate,
            LocalDate withdrawalEndDate,
            String vetName) {}

    public record MedicationInfo(
            String livestockTagNumber,
            String medicationName,
            LocalDate administeredDate,
            LocalDate withdrawalEndDate,
            String vetName) {}

    public record MilkSafety(boolean eligibleAtCollection, String status) {}
}
