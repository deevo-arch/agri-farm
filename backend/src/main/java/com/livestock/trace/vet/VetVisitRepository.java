package com.livestock.trace.vet;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VetVisitRepository extends MongoRepository<VetVisit, Long> {

    List<VetVisit> findByLivestockId(Long livestockId);

    List<VetVisit> findByVetId(Long vetId);

    List<VetVisit> findByRequestedById(Long requestedById);

    List<VetVisit> findByStatus(VetVisitStatus status);
}
