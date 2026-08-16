package com.livestock.trace.qr;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    Optional<QrCode> findByToken(String token);

    Optional<QrCode> findByMilkBatchId(Long milkBatchId);

    boolean existsByToken(String token);
}
