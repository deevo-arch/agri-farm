package com.livestock.trace.milk;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilkBatchRepository extends JpaRepository<MilkBatch, Long> {

    List<MilkBatch> findByFarmId(Long farmId);

    boolean existsByBatchCode(String batchCode);
}
