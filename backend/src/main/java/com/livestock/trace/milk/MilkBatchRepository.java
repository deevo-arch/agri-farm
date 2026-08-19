package com.livestock.trace.milk;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MilkBatchRepository extends MongoRepository<MilkBatch, Long> {

    List<MilkBatch> findByFarmId(Long farmId);

    boolean existsByBatchCode(String batchCode);
}
