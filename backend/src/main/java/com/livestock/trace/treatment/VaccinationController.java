package com.livestock.trace.treatment;

import com.livestock.trace.treatment.dto.VaccinationCreateRequest;
import com.livestock.trace.treatment.dto.VaccinationResponse;
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
@RequestMapping("/api/vaccinations")
@RequiredArgsConstructor
public class VaccinationController {

    private final TreatmentService treatmentService;

    @PostMapping
    public ResponseEntity<VaccinationResponse> createVaccination(
            @Valid @RequestBody VaccinationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(treatmentService.createVaccination(request));
    }

    @GetMapping("/livestock/{livestockId}")
    public ResponseEntity<List<VaccinationResponse>> getByLivestock(@PathVariable Long livestockId) {
        return ResponseEntity.ok(treatmentService.getVaccinationResponsesByLivestock(livestockId));
    }
}
