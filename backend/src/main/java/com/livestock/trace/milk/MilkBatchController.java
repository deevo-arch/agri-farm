package com.livestock.trace.milk;

import com.livestock.trace.milk.dto.MilkBatchCreateRequest;
import com.livestock.trace.milk.dto.MilkBatchResponse;
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
@RequestMapping("/api/milk-batches")
@RequiredArgsConstructor
public class MilkBatchController {

    private final MilkBatchService milkBatchService;

    @PostMapping
    public ResponseEntity<MilkBatchResponse> createMilkBatch(
            @Valid @RequestBody MilkBatchCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(milkBatchService.createMilkBatch(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MilkBatchResponse> getMilkBatch(@PathVariable Long id) {
        return ResponseEntity.ok(milkBatchService.getResponseById(id));
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<MilkBatchResponse>> getByFarm(@PathVariable Long farmId) {
        return ResponseEntity.ok(milkBatchService.getResponsesByFarm(farmId));
    }
}
