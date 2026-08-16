package com.livestock.trace.farm;

import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserService userService;

    public Farm getById(Long id) {
        return farmRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + id));
    }

    @Transactional(readOnly = true)
    public FarmResponse getResponseById(Long id) {
        return FarmResponse.from(getById(id));
    }

    @Transactional(readOnly = true)
    public List<FarmResponse> getResponsesByOwner(Long ownerId) {
        return farmRepository.findByOwnerId(ownerId).stream().map(FarmResponse::from).toList();
    }

    @Transactional
    public FarmResponse createFarm(FarmCreateRequest request) {
        User owner = userService.getById(request.ownerId());
        Farm farm =
                Farm.builder()
                        .name(request.name())
                        .location(request.location())
                        .owner(owner)
                        .build();
        return FarmResponse.from(farmRepository.save(farm));
    }
}
