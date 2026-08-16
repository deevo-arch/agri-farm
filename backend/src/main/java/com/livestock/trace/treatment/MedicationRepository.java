package com.livestock.trace.treatment;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByLivestockId(Long livestockId);

    boolean existsByLivestockIdAndWithdrawalEndDateGreaterThanEqual(Long livestockId, LocalDate date);
}
