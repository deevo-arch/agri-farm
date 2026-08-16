package com.livestock.trace.farm;

import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.livestock.dto.LivestockResponse;
import com.livestock.trace.security.AuthenticatedUser;
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
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;
    private final LivestockService livestockService;

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(
            @Valid @RequestBody FarmCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        // Ownership is always the authenticated caller; any ownerId in the request body is ignored.
        FarmCreateRequest ownedRequest =
                new FarmCreateRequest(request.name(), request.location(), currentUser.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(farmService.createFarm(ownedRequest));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<FarmResponse>> getMyFarms(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(farmService.getResponsesByOwner(currentUser.id()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getFarm(@PathVariable Long id) {
        return ResponseEntity.ok(farmService.getResponseById(id));
    }

    @GetMapping("/{id}/livestock")
    public ResponseEntity<List<LivestockResponse>> getFarmLivestock(@PathVariable Long id) {
        farmService.getById(id);
        return ResponseEntity.ok(livestockService.getResponsesByFarm(id));
    }
}
