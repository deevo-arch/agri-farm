package com.livestock.trace.vet;

import com.livestock.trace.vet.dto.VetVisitCreateRequest;
import com.livestock.trace.vet.dto.VetVisitResponse;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/vet-visits")
@RequiredArgsConstructor
public class VetVisitController {

    private final VetVisitService vetVisitService;

    @PostMapping
    public ResponseEntity<VetVisitResponse> createVetVisit(
            @Valid @RequestBody VetVisitCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vetVisitService.createVetVisit(request));
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
}
