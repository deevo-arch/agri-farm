package com.livestock.trace.publicapi;

import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.milk.MilkBatch;
import com.livestock.trace.publicapi.dto.PublicTraceResponse;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.FarmInfo;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.LivestockInfo;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.MedicationInfo;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.MilkBatchInfo;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.MilkSafety;
import com.livestock.trace.publicapi.dto.PublicTraceResponse.VaccinationInfo;
import com.livestock.trace.qr.QrCode;
import com.livestock.trace.qr.QrCodeRepository;
import com.livestock.trace.treatment.TreatmentService;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TraceabilityService {

    private final QrCodeRepository qrCodeRepository;
    private final TreatmentService treatmentService;

    @Transactional(readOnly = true)
    public PublicTraceResponse getTraceByToken(String token) {
        QrCode qrCode =
                qrCodeRepository
                        .findByToken(token)
                        .orElseThrow(() -> new ResourceNotFoundException("Trace not found for token: " + token));

        MilkBatch milkBatch = qrCode.getMilkBatch();
        Farm farm = milkBatch.getFarm();
        Set<Livestock> livestockSet = milkBatch.getLivestock();

        List<LivestockInfo> livestockInfos =
                livestockSet.stream().map(l -> new LivestockInfo(l.getTagNumber(), l.getSpecies())).toList();

        List<VaccinationInfo> vaccinations =
                livestockSet.stream()
                        .flatMap(l -> treatmentService.getVaccinationResponsesByLivestock(l.getId()).stream())
                        .map(
                                v ->
                                        new VaccinationInfo(
                                                v.livestockTagNumber(),
                                                v.vaccineName(),
                                                v.administeredDate(),
                                                v.withdrawalEndDate(),
                                                v.administeredByName()))
                        .toList();

        List<MedicationInfo> medications =
                livestockSet.stream()
                        .flatMap(l -> treatmentService.getMedicationResponsesByLivestock(l.getId()).stream())
                        .map(
                                m ->
                                        new MedicationInfo(
                                                m.livestockTagNumber(),
                                                m.medicationName(),
                                                m.administeredDate(),
                                                m.withdrawalEndDate(),
                                                m.administeredByName()))
                        .toList();

        boolean eligibleAtCollection =
                livestockSet.stream()
                        .noneMatch(l -> treatmentService.hasActiveWithdrawal(l.getId(), milkBatch.getCollectionDate()));

        return new PublicTraceResponse(
                true,
                "VERIFIED",
                new MilkBatchInfo(milkBatch.getBatchCode(), milkBatch.getCollectionDate(), milkBatch.getQuantityLitres()),
                livestockInfos,
                new FarmInfo(farm.getName(), farm.getLocation()),
                vaccinations,
                medications,
                new MilkSafety(
                        eligibleAtCollection, eligibleAtCollection ? "SAFE_FOR_COLLECTION" : "NOT_SAFE_FOR_COLLECTION"));
    }
}
