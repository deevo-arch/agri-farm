package com.livestock.trace.livestock;

import com.livestock.trace.common.SequenceGeneratorService;
import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockResponse;
import com.livestock.trace.livestock.dto.LivestockUpdateRequest;
import com.livestock.trace.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LivestockService {

    private final LivestockRepository livestockRepository;
    private final FarmService farmService;
    private final SequenceGeneratorService sequenceGeneratorService;

    public Livestock getById(Long id) {
        return livestockRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livestock not found: " + id));
    }

    public LivestockResponse getResponseById(Long id) {
        return LivestockResponse.from(getById(id));
    }

    public List<LivestockResponse> getResponsesByFarm(Long farmId) {
        return livestockRepository.findByFarmId(farmId).stream().map(LivestockResponse::from).toList();
    }

    public LivestockResponse createLivestock(LivestockCreateRequest request, AuthenticatedUser currentUser) {
        Farm farm = farmService.getById(request.farmId());
        farmService.requireOwnership(farm, currentUser);

        livestockRepository
                .findByFarmIdAndTagNumber(farm.getId(), request.tagNumber())
                .ifPresent(
                        existing -> {
                            throw new BusinessRuleException(
                                    "Tag number already in use on this farm: " + request.tagNumber());
                        });

        Livestock livestock =
                Livestock.builder()
                        .tagNumber(request.tagNumber())
                        .species(request.species())
                        .dateOfBirth(request.dateOfBirth())
                        .farm(farm)
                        .build();
        livestock.setId(sequenceGeneratorService.generateSequence(Livestock.class.getSimpleName()));
        return LivestockResponse.from(livestockRepository.save(livestock));
    }

    public LivestockResponse updateLivestock(
            Long id, LivestockUpdateRequest request, AuthenticatedUser currentUser) {
        Livestock livestock = getById(id);
        farmService.requireOwnership(livestock.getFarm(), currentUser);

        livestock.setSpecies(request.species());
        livestock.setDateOfBirth(request.dateOfBirth());
        livestock.setStatus(request.status());
        return LivestockResponse.from(livestockRepository.save(livestock));
    }
}
