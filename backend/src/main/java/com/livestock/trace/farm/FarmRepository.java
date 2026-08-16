package com.livestock.trace.farm;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByOwnerId(Long ownerId);
}
