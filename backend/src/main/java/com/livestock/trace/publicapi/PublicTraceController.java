package com.livestock.trace.publicapi;

import com.livestock.trace.publicapi.dto.PublicTraceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/trace")
@RequiredArgsConstructor
public class PublicTraceController {

    private final TraceabilityService traceabilityService;

    @GetMapping("/{token}")
    public ResponseEntity<PublicTraceResponse> getTrace(@PathVariable String token) {
        return ResponseEntity.ok(traceabilityService.getTraceByToken(token));
    }
}
