package com.livestock.trace.qr;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QrCodeRepository extends MongoRepository<QrCode, Long> {

    Optional<QrCode> findByToken(String token);

    Optional<QrCode> findByMilkBatchId(Long milkBatchId);

    boolean existsByToken(String token);
}
