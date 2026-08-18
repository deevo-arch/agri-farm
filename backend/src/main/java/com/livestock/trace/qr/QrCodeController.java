package com.livestock.trace.qr;

import com.livestock.trace.qr.dto.QrCodeResponse;
import com.livestock.trace.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/milk-batches")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    @PostMapping("/{milkBatchId}/qr")
    public ResponseEntity<QrCodeResponse> generateQr(
            @PathVariable Long milkBatchId, @AuthenticationPrincipal AuthenticatedUser currentUser) {
        boolean alreadyExists = qrCodeService.existsForMilkBatch(milkBatchId);
        QrCodeResponse response = qrCodeService.generateForMilkBatch(milkBatchId, currentUser);
        HttpStatus status = alreadyExists ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(response);
    }
}
