package com.livestock.trace.farm;

import com.livestock.trace.common.SequenceGeneratorService;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.farm.dto.FarmUpdateRequest;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserService userService;
    private final SequenceGeneratorService sequenceGeneratorService;

    public Farm getById(Long id) {
        return farmRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + id));
    }

    public FarmResponse getResponseById(Long id) {
        return FarmResponse.from(getById(id));
    }

    public List<FarmResponse> getResponsesByOwner(Long ownerId) {
        return farmRepository.findByOwnerId(ownerId).stream().map(FarmResponse::from).toList();
    }

    public void requireOwnership(Farm farm, AuthenticatedUser currentUser) {
        boolean isOwner = farm.getOwner().getId().equals(currentUser.id());
        boolean isAdmin = currentUser.role() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to perform this action.");
        }
    }

    public FarmResponse createFarm(FarmCreateRequest request) {
        User owner = userService.getById(request.ownerId());
        Farm farm =
                Farm.builder()
                        .name(request.name())
                        .location(request.location())
                        .owner(owner)
                        .build();
        farm.setId(sequenceGeneratorService.generateSequence(Farm.class.getSimpleName()));
        return FarmResponse.from(farmRepository.save(farm));
    }

    public FarmResponse updateFarm(Long id, FarmUpdateRequest request, AuthenticatedUser currentUser) {
        Farm farm = getById(id);
        requireOwnership(farm, currentUser);
        farm.setName(request.name());
        farm.setLocation(request.location());
        return FarmResponse.from(farmRepository.save(farm));
    }
}
