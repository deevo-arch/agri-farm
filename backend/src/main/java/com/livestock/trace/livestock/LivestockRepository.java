package com.livestock.trace.livestock;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LivestockRepository extends MongoRepository<Livestock, Long> {

    List<Livestock> findByFarmId(Long farmId);

    Optional<Livestock> findByFarmIdAndTagNumber(Long farmId, String tagNumber);
}
