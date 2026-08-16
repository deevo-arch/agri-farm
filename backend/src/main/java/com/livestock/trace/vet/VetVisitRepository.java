package com.livestock.trace.vet;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VetVisitRepository extends JpaRepository<VetVisit, Long> {

    List<VetVisit> findByLivestockId(Long livestockId);

    List<VetVisit> findByVetId(Long vetId);
}
