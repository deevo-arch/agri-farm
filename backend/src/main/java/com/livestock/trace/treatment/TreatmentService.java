package com.livestock.trace.treatment;

import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.treatment.dto.MedicationCreateRequest;
import com.livestock.trace.treatment.dto.MedicationResponse;
import com.livestock.trace.treatment.dto.VaccinationCreateRequest;
import com.livestock.trace.treatment.dto.VaccinationResponse;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserService;
import com.livestock.trace.vet.VetVisit;
import com.livestock.trace.vet.VetVisitService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final VaccinationRepository vaccinationRepository;
    private final MedicationRepository medicationRepository;
    private final LivestockService livestockService;
    private final UserService userService;
    private final VetVisitService vetVisitService;

    @Transactional(readOnly = true)
    public List<VaccinationResponse> getVaccinationResponsesByLivestock(Long livestockId) {
        return vaccinationRepository.findByLivestockId(livestockId).stream()
                .map(VaccinationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicationResponse> getMedicationResponsesByLivestock(Long livestockId) {
        return medicationRepository.findByLivestockId(livestockId).stream()
                .map(MedicationResponse::from)
                .toList();
    }

    @Transactional
    public VaccinationResponse createVaccination(VaccinationCreateRequest request) {
        Livestock livestock = livestockService.getById(request.livestockId());
        User administeredBy = userService.getById(request.administeredById());
        VetVisit vetVisit =
                request.vetVisitId() != null ? vetVisitService.getById(request.vetVisitId()) : null;

        Vaccination vaccination =
                Vaccination.builder()
                        .livestock(livestock)
                        .vetVisit(vetVisit)
                        .administeredBy(administeredBy)
                        .vaccineName(request.vaccineName())
                        .administeredDate(request.administeredDate())
                        .withdrawalEndDate(request.withdrawalEndDate())
                        .build();
        return VaccinationResponse.from(vaccinationRepository.save(vaccination));
    }

    @Transactional
    public MedicationResponse createMedication(MedicationCreateRequest request) {
        Livestock livestock = livestockService.getById(request.livestockId());
        User administeredBy = userService.getById(request.administeredById());
        VetVisit vetVisit =
                request.vetVisitId() != null ? vetVisitService.getById(request.vetVisitId()) : null;

        Medication medication =
                Medication.builder()
                        .livestock(livestock)
                        .vetVisit(vetVisit)
                        .administeredBy(administeredBy)
                        .medicationName(request.medicationName())
                        .dosage(request.dosage())
                        .administeredDate(request.administeredDate())
                        .withdrawalEndDate(request.withdrawalEndDate())
                        .build();
        return MedicationResponse.from(medicationRepository.save(medication));
    }

    // Seam for Phase 4's withdrawal rule — not yet called by MilkBatchService.
    public boolean hasActiveWithdrawal(Long livestockId, LocalDate asOfDate) {
        return vaccinationRepository.existsByLivestockIdAndWithdrawalEndDateGreaterThanEqual(
                        livestockId, asOfDate)
                || medicationRepository.existsByLivestockIdAndWithdrawalEndDateGreaterThanEqual(
                        livestockId, asOfDate);
    }
}
