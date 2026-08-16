package com.livestock.trace.livestock;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LivestockService {

    private final LivestockRepository livestockRepository;
    private final FarmService farmService;

    public Livestock getById(Long id) {
        return livestockRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livestock not found: " + id));
    }

    @Transactional(readOnly = true)
    public LivestockResponse getResponseById(Long id) {
        return LivestockResponse.from(getById(id));
    }

    @Transactional(readOnly = true)
    public List<LivestockResponse> getResponsesByFarm(Long farmId) {
        return livestockRepository.findByFarmId(farmId).stream().map(LivestockResponse::from).toList();
    }

    @Transactional
    public LivestockResponse createLivestock(LivestockCreateRequest request) {
        Farm farm = farmService.getById(request.farmId());

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
        return LivestockResponse.from(livestockRepository.save(livestock));
    }
}
