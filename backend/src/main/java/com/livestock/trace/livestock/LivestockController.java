package com.livestock.trace.livestock;

import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockHealthResponse;
import com.livestock.trace.livestock.dto.LivestockResponse;
import com.livestock.trace.treatment.TreatmentService;
import com.livestock.trace.vet.VetVisitService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/livestock")
@RequiredArgsConstructor
public class LivestockController {

    private final LivestockService livestockService;
    private final VetVisitService vetVisitService;
    private final TreatmentService treatmentService;

    @PostMapping
    public ResponseEntity<LivestockResponse> createLivestock(
            @Valid @RequestBody LivestockCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livestockService.createLivestock(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivestockResponse> getLivestock(@PathVariable Long id) {
        return ResponseEntity.ok(livestockService.getResponseById(id));
    }

    @GetMapping("/{id}/health")
    public ResponseEntity<LivestockHealthResponse> getLivestockHealth(@PathVariable Long id) {
        LivestockResponse livestock = livestockService.getResponseById(id);
        LivestockHealthResponse health =
                new LivestockHealthResponse(
                        livestock,
                        vetVisitService.getResponsesByLivestock(id),
                        treatmentService.getVaccinationResponsesByLivestock(id),
                        treatmentService.getMedicationResponsesByLivestock(id),
                        treatmentService.hasActiveWithdrawal(id, LocalDate.now()));
        return ResponseEntity.ok(health);
    }
}
