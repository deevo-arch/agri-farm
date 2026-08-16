package com.livestock.trace.livestock;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LivestockRepository extends JpaRepository<Livestock, Long> {

    List<Livestock> findByFarmId(Long farmId);

    Optional<Livestock> findByFarmIdAndTagNumber(Long farmId, String tagNumber);
}
