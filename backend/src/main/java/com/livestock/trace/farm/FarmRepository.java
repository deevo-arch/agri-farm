package com.livestock.trace.farm;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FarmRepository extends MongoRepository<Farm, Long> {

    List<Farm> findByOwnerId(Long ownerId);
}
