package com.livestock.trace.treatment;

import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.treatment.dto.MedicationCreateRequest;
import com.livestock.trace.treatment.dto.MedicationResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final TreatmentService treatmentService;

    @PostMapping
    public ResponseEntity<MedicationResponse> createMedication(
            @Valid @RequestBody MedicationCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(treatmentService.createMedication(request, currentUser));
    }

    @GetMapping("/livestock/{livestockId}")
    public ResponseEntity<List<MedicationResponse>> getByLivestock(@PathVariable Long livestockId) {
        return ResponseEntity.ok(treatmentService.getMedicationResponsesByLivestock(livestockId));
    }
}
