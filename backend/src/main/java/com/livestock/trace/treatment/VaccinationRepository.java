package com.livestock.trace.treatment;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {

    List<Vaccination> findByLivestockId(Long livestockId);

    boolean existsByLivestockIdAndWithdrawalEndDateGreaterThanEqual(Long livestockId, LocalDate date);
}
