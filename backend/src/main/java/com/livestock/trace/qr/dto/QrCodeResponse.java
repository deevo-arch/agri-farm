package com.livestock.trace.qr.dto;

public record QrCodeResponse(Long qrId, Long milkBatchId, String token, String traceUrl, String qrImage) {}
