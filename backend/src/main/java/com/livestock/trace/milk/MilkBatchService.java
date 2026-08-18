package com.livestock.trace.milk;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.milk.dto.MilkBatchCreateRequest;
import com.livestock.trace.milk.dto.MilkBatchResponse;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.treatment.TreatmentService;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MilkBatchService {

    private final MilkBatchRepository milkBatchRepository;
    private final FarmService farmService;
    private final LivestockService livestockService;
    private final UserService userService;
    private final TreatmentService treatmentService;

    public MilkBatch getById(Long id) {
        return milkBatchRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MilkBatch not found: " + id));
    }

    @Transactional(readOnly = true)
    public MilkBatchResponse getResponseById(Long id) {
        return MilkBatchResponse.from(getById(id));
    }

    @Transactional(readOnly = true)
    public List<MilkBatchResponse> getResponsesByFarm(Long farmId) {
        return milkBatchRepository.findByFarmId(farmId).stream().map(MilkBatchResponse::from).toList();
    }

    // Resolves the batch's lazy farm/owner association and checks ownership, all within this
    // method's own transaction. Called from other services (e.g. QrCodeService) precisely so that
    // it runs as its own self-contained transaction via the Spring proxy, rather than being folded
    // into a caller's longer-lived transaction — see QrCodeService.generateForMilkBatch for why
    // that distinction matters for the create/recover race path.
    @Transactional(readOnly = true)
    public void requireOwnershipOfMilkBatch(Long milkBatchId, AuthenticatedUser currentUser) {
        MilkBatch milkBatch = getById(milkBatchId);
        farmService.requireOwnership(milkBatch.getFarm(), currentUser);
    }

    @Transactional
    public MilkBatchResponse createMilkBatch(MilkBatchCreateRequest request, AuthenticatedUser currentUser) {
        Farm farm = farmService.getById(request.farmId());
        farmService.requireOwnership(farm, currentUser);
        User collectedBy =
                request.collectedById() != null ? userService.getById(request.collectedById()) : null;

        Set<Livestock> livestock =
                request.livestockIds().stream()
                        .map(livestockService::getById)
                        .collect(Collectors.toSet());

        List<String> foreignFarmTags =
                livestock.stream()
                        .filter(animal -> !animal.getFarm().getId().equals(farm.getId()))
                        .map(Livestock::getTagNumber)
                        .toList();
        if (!foreignFarmTags.isEmpty()) {
            throw new BusinessRuleException(
                    "Animal(s) do not belong to farm " + farm.getId() + ": " + String.join(", ", foreignFarmTags));
        }

        if (milkBatchRepository.existsByBatchCode(request.batchCode())) {
            throw new BusinessRuleException("Batch code already in use: " + request.batchCode());
        }

        List<String> blockedTags =
                livestock.stream()
                        .filter(
                                animal ->
                                        treatmentService.hasActiveWithdrawal(animal.getId(), request.collectionDate()))
                        .map(Livestock::getTagNumber)
                        .toList();
        if (!blockedTags.isEmpty()) {
            throw new BusinessRuleException(
                    "Milk cannot be collected: animal(s) under active withdrawal period: "
                            + String.join(", ", blockedTags));
        }

        MilkBatch milkBatch =
                MilkBatch.builder()
                        .batchCode(request.batchCode())
                        .farm(farm)
                        .collectedBy(collectedBy)
                        .collectionDate(request.collectionDate())
                        .quantityLitres(request.quantityLitres())
                        .livestock(livestock)
                        .build();
        return MilkBatchResponse.from(milkBatchRepository.save(milkBatch));
    }
}
