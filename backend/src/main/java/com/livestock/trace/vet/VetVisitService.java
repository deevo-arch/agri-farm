package com.livestock.trace.vet;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import com.livestock.trace.vet.dto.VetVisitCreateRequest;
import com.livestock.trace.vet.dto.VetVisitResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VetVisitService {

    private final VetVisitRepository vetVisitRepository;
    private final LivestockService livestockService;
    private final UserService userService;

    public VetVisit getById(Long id) {
        return vetVisitRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VetVisit not found: " + id));
    }

    @Transactional(readOnly = true)
    public VetVisitResponse getResponseById(Long id) {
        return VetVisitResponse.from(getById(id));
    }

    @Transactional(readOnly = true)
    public List<VetVisitResponse> getResponsesByLivestock(Long livestockId) {
        return vetVisitRepository.findByLivestockId(livestockId).stream()
                .map(VetVisitResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VetVisitResponse> getResponsesByVet(Long vetId) {
        return vetVisitRepository.findByVetId(vetId).stream().map(VetVisitResponse::from).toList();
    }

    @Transactional
    public VetVisitResponse createVetVisit(VetVisitCreateRequest request) {
        Livestock livestock = livestockService.getById(request.livestockId());
        User vet = userService.getById(request.vetId());
        if (vet.getRole() != Role.VET) {
            throw new BusinessRuleException("User " + vet.getId() + " does not have the VET role");
        }

        VetVisit vetVisit =
                VetVisit.builder()
                        .livestock(livestock)
                        .vet(vet)
                        .visitDate(request.visitDate())
                        .notes(request.notes())
                        .build();
        return VetVisitResponse.from(vetVisitRepository.save(vetVisit));
    }
}
