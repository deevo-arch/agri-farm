package com.livestock.trace.vet;

import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.vet.dto.VetVisitCreateRequest;
import com.livestock.trace.vet.dto.VetVisitResponse;
import com.livestock.trace.vet.dto.VetVisitUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vet-visits")
@RequiredArgsConstructor
public class VetVisitController {

    private final VetVisitService vetVisitService;

    @PostMapping
    public ResponseEntity<VetVisitResponse> createVetVisit(
            @Valid @RequestBody VetVisitCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vetVisitService.createVetVisit(request, currentUser));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<VetVisitResponse>> getMyRequests(
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(vetVisitService.getResponsesByRequester(currentUser.id()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<VetVisitResponse>> getPending() {
        return ResponseEntity.ok(vetVisitService.getPendingResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VetVisitResponse> getVetVisit(@PathVariable Long id) {
        return ResponseEntity.ok(vetVisitService.getResponseById(id));
    }

    @GetMapping("/vet/{vetId}")
    public ResponseEntity<List<VetVisitResponse>> getByVet(@PathVariable Long vetId) {
        return ResponseEntity.ok(vetVisitService.getResponsesByVet(vetId));
    }

    @GetMapping("/livestock/{livestockId}")
    public ResponseEntity<List<VetVisitResponse>> getByLivestock(@PathVariable Long livestockId) {
        return ResponseEntity.ok(vetVisitService.getResponsesByLivestock(livestockId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VetVisitResponse> updateVetVisit(
            @PathVariable Long id,
            @Valid @RequestBody VetVisitUpdateRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(vetVisitService.updateVisit(id, request, currentUser));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<VetVisitResponse> accept(
            @PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(vetVisitService.acceptVisit(id, currentUser));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<VetVisitResponse> reject(
            @PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(vetVisitService.rejectVisit(id, currentUser));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<VetVisitResponse> complete(
            @PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(vetVisitService.completeVisit(id, currentUser));
    }
}
