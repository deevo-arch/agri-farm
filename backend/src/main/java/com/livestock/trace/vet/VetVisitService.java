package com.livestock.trace.vet;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import com.livestock.trace.vet.dto.VetVisitCreateRequest;
import com.livestock.trace.vet.dto.VetVisitResponse;
import com.livestock.trace.vet.dto.VetVisitUpdateRequest;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VetVisitService {

    private final VetVisitRepository vetVisitRepository;
    private final LivestockService livestockService;
    private final FarmService farmService;
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

    @Transactional(readOnly = true)
    public List<VetVisitResponse> getResponsesByRequester(Long requestedById) {
        return vetVisitRepository.findByRequestedById(requestedById).stream()
                .map(VetVisitResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VetVisitResponse> getPendingResponses() {
        return vetVisitRepository.findByStatus(VetVisitStatus.REQUESTED).stream()
                .map(VetVisitResponse::from)
                .toList();
    }

    // Farmer requests a visit for livestock on a farm they own. requestedBy is always the
    // authenticated caller; vet/status are never accepted from the client.
    @Transactional
    public VetVisitResponse createVetVisit(VetVisitCreateRequest request, AuthenticatedUser currentUser) {
        Livestock livestock = livestockService.getById(request.livestockId());
        farmService.requireOwnership(livestock.getFarm(), currentUser);
        User requestedBy = userService.getById(currentUser.id());

        VetVisit vetVisit =
                VetVisit.builder()
                        .livestock(livestock)
                        .requestedBy(requestedBy)
                        .preferredDate(request.preferredDate())
                        .reason(request.reason())
                        .notes(request.notes())
                        .status(VetVisitStatus.REQUESTED)
                        .build();
        return VetVisitResponse.from(vetVisitRepository.save(vetVisit));
    }

    // Farmer (or ADMIN) may edit their own request's preferredDate/reason/notes, but only while
    // it's still REQUESTED — once a vet has acted on it, changing the details behind their back
    // would break the integrity of the appointment history.
    @Transactional
    public VetVisitResponse updateVisit(Long id, VetVisitUpdateRequest request, AuthenticatedUser currentUser) {
        VetVisit visit = getById(id);
        farmService.requireOwnership(visit.getLivestock().getFarm(), currentUser);
        requireTransition(visit, VetVisitStatus.REQUESTED, "edit");

        visit.setPreferredDate(request.preferredDate());
        visit.setReason(request.reason());
        visit.setNotes(request.notes());
        return VetVisitResponse.from(vetVisitRepository.save(visit));
    }

    // Any VET (or ADMIN) may accept a pending request; nobody is assigned yet at REQUESTED, so
    // there's no prior "owner" to check here beyond the state transition itself.
    @Transactional
    public VetVisitResponse acceptVisit(Long id, AuthenticatedUser currentUser) {
        VetVisit visit = getById(id);
        requireTransition(visit, VetVisitStatus.REQUESTED, "accept");
        visit.setVet(userService.getById(currentUser.id()));
        visit.setStatus(VetVisitStatus.ACCEPTED);
        return VetVisitResponse.from(vetVisitRepository.save(visit));
    }

    @Transactional
    public VetVisitResponse rejectVisit(Long id, AuthenticatedUser currentUser) {
        VetVisit visit = getById(id);
        requireTransition(visit, VetVisitStatus.REQUESTED, "reject");
        visit.setStatus(VetVisitStatus.REJECTED);
        return VetVisitResponse.from(vetVisitRepository.save(visit));
    }

    // Completion requires both the correct state (ACCEPTED) and that the caller is the vet the
    // visit is assigned to (ADMIN bypasses, consistent with the farm-ownership model elsewhere).
    @Transactional
    public VetVisitResponse completeVisit(Long id, AuthenticatedUser currentUser) {
        VetVisit visit = getById(id);
        requireTransition(visit, VetVisitStatus.ACCEPTED, "complete");
        requireAssignedVet(visit, currentUser);
        visit.setStatus(VetVisitStatus.COMPLETED);
        visit.setCompletedAt(LocalDateTime.now());
        return VetVisitResponse.from(vetVisitRepository.save(visit));
    }

    private void requireTransition(VetVisit visit, VetVisitStatus requiredCurrent, String action) {
        if (visit.getStatus() != requiredCurrent) {
            throw new BusinessRuleException(
                    "Cannot " + action + " a vet visit in status " + visit.getStatus());
        }
    }

    private void requireAssignedVet(VetVisit visit, AuthenticatedUser currentUser) {
        boolean isAssignedVet = visit.getVet() != null && visit.getVet().getId().equals(currentUser.id());
        boolean isAdmin = currentUser.role() == Role.ADMIN;
        if (!isAssignedVet && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to perform this action.");
        }
    }
}
