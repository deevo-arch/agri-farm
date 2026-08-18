package com.livestock.trace.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.livestock.trace.milk.MilkBatch;
import com.livestock.trace.milk.MilkBatchService;
import com.livestock.trace.qr.dto.QrCodeResponse;
import com.livestock.trace.security.AuthenticatedUser;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QrCodeService {

    private static final int TOKEN_BYTES = 24;
    private static final int QR_IMAGE_SIZE = 300;

    private final QrCodeRepository qrCodeRepository;
    private final MilkBatchService milkBatchService;
    private final String traceBaseUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public QrCodeService(
            QrCodeRepository qrCodeRepository,
            MilkBatchService milkBatchService,
            @Value("${app.public.trace-base-url}") String traceBaseUrl) {
        this.qrCodeRepository = qrCodeRepository;
        this.milkBatchService = milkBatchService;
        this.traceBaseUrl = traceBaseUrl;
    }

    @Transactional(readOnly = true)
    public boolean existsForMilkBatch(Long milkBatchId) {
        return qrCodeRepository.findByMilkBatchId(milkBatchId).isPresent();
    }

    // Deliberately NOT @Transactional at this level: the ownership check (below) and the
    // create-or-recover logic (in createQrCode) must each run in their own separate transaction.
    // milkBatchService.requireOwnershipOfMilkBatch is a cross-bean call, so Spring's proxy gives it
    // a fresh transaction to resolve MilkBatch.farm/Farm.owner (lazy, open-in-view is disabled).
    // If this method itself were @Transactional, that transaction would also wrap createQrCode's
    // saveAndFlush — and when two near-simultaneous requests race on the unique constraint, the
    // loser's recovery query would run on the same now-poisoned session as the failed insert
    // (Hibernate: "don't flush the Session after an exception occurs"), instead of the fresh
    // session it actually needs.
    public QrCodeResponse generateForMilkBatch(Long milkBatchId, AuthenticatedUser currentUser) {
        milkBatchService.requireOwnershipOfMilkBatch(milkBatchId, currentUser);

        return qrCodeRepository
                .findByMilkBatchId(milkBatchId)
                .map(this::buildResponse)
                .orElseGet(() -> createQrCode(milkBatchId));
    }

    // Two near-simultaneous requests can both pass the findByMilkBatchId check; the loser recovers
    // from the unique-constraint violation by re-fetching what the winner just created.
    private QrCodeResponse createQrCode(Long milkBatchId) {
        MilkBatch milkBatch = milkBatchService.getById(milkBatchId);
        try {
            QrCode created =
                    qrCodeRepository.saveAndFlush(
                            QrCode.builder().token(generateUniqueToken()).milkBatch(milkBatch).build());
            return buildResponse(created);
        } catch (DataIntegrityViolationException ex) {
            return qrCodeRepository
                    .findByMilkBatchId(milkBatchId)
                    .map(this::buildResponse)
                    .orElseThrow(() -> ex);
        }
    }

    private String generateUniqueToken() {
        String token;
        do {
            byte[] bytes = new byte[TOKEN_BYTES];
            secureRandom.nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } while (qrCodeRepository.existsByToken(token));
        return token;
    }

    private QrCodeResponse buildResponse(QrCode qrCode) {
        String traceUrl = traceBaseUrl + "/" + qrCode.getToken();
        String qrImage = generateQrImageDataUri(traceUrl);
        return new QrCodeResponse(
                qrCode.getId(), qrCode.getMilkBatch().getId(), qrCode.getToken(), traceUrl, qrImage);
    }

    private String generateQrImageDataUri(String content) {
        try {
            BitMatrix matrix =
                    new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, QR_IMAGE_SIZE, QR_IMAGE_SIZE);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            String base64 = Base64.getEncoder().encodeToString(out.toByteArray());
            return "data:image/png;base64," + base64;
        } catch (WriterException | IOException ex) {
            throw new IllegalStateException("Failed to generate QR code image", ex);
        }
    }
}
