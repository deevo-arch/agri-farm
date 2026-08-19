package com.livestock.trace.treatment;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VaccinationRepository extends MongoRepository<Vaccination, Long> {

    List<Vaccination> findByLivestockId(Long livestockId);

    boolean existsByLivestockIdAndWithdrawalEndDateGreaterThanEqual(Long livestockId, LocalDate date);
}
