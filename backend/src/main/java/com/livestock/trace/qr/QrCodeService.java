package com.livestock.trace.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.livestock.trace.common.SequenceGeneratorService;
import com.livestock.trace.milk.MilkBatch;
import com.livestock.trace.milk.MilkBatchService;
import com.livestock.trace.qr.dto.QrCodeResponse;
import com.livestock.trace.security.AuthenticatedUser;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class QrCodeService {

    private static final int TOKEN_BYTES = 24;
    private static final int QR_IMAGE_SIZE = 300;

    private final QrCodeRepository qrCodeRepository;
    private final MilkBatchService milkBatchService;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final String traceBaseUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public QrCodeService(
            QrCodeRepository qrCodeRepository,
            MilkBatchService milkBatchService,
            SequenceGeneratorService sequenceGeneratorService,
            @Value("${app.public.trace-base-url}") String traceBaseUrl) {
        this.qrCodeRepository = qrCodeRepository;
        this.milkBatchService = milkBatchService;
        this.sequenceGeneratorService = sequenceGeneratorService;
        this.traceBaseUrl = traceBaseUrl;
    }

    public boolean existsForMilkBatch(Long milkBatchId) {
        return qrCodeRepository.findByMilkBatchId(milkBatchId).isPresent();
    }

    public QrCodeResponse generateForMilkBatch(Long milkBatchId, AuthenticatedUser currentUser) {
        milkBatchService.requireOwnershipOfMilkBatch(milkBatchId, currentUser);

        return qrCodeRepository
                .findByMilkBatchId(milkBatchId)
                .map(this::buildResponse)
                .orElseGet(() -> createQrCode(milkBatchId));
    }

    private QrCodeResponse createQrCode(Long milkBatchId) {
        MilkBatch milkBatch = milkBatchService.getById(milkBatchId);
        try {
            QrCode qrCode = QrCode.builder().token(generateUniqueToken()).milkBatch(milkBatch).build();
            qrCode.setId(sequenceGeneratorService.generateSequence(QrCode.class.getSimpleName()));
            QrCode created = qrCodeRepository.save(qrCode);
            return buildResponse(created);
        } catch (DuplicateKeyException ex) {
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
