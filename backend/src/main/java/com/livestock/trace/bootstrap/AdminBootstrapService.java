package com.livestock.trace.bootstrap;

import com.livestock.trace.common.SequenceGeneratorService;
import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.farm.FarmRepository;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockRepository;
import com.livestock.trace.livestock.LivestockStatus;
import com.livestock.trace.livestock.Species;
import com.livestock.trace.milk.MilkBatch;
import com.livestock.trace.milk.MilkBatchRepository;
import com.livestock.trace.qr.QrCode;
import com.livestock.trace.qr.QrCodeRepository;
import com.livestock.trace.treatment.Medication;
import com.livestock.trace.treatment.MedicationRepository;
import com.livestock.trace.treatment.Vaccination;
import com.livestock.trace.treatment.VaccinationRepository;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserRepository;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.vet.VetVisit;
import com.livestock.trace.vet.VetVisitRepository;
import com.livestock.trace.vet.VetVisitStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AdminBootstrapService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final FarmRepository farmRepository;
    private final LivestockRepository livestockRepository;
    private final VetVisitRepository vetVisitRepository;
    private final VaccinationRepository vaccinationRepository;
    private final MedicationRepository medicationRepository;
    private final MilkBatchRepository milkBatchRepository;
    private final QrCodeRepository qrCodeRepository;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final boolean enabled;
    private final String email;
    private final String password;
    private final String fullName;

    public AdminBootstrapService(
            UserRepository userRepository,
            UserService userService,
            FarmRepository farmRepository,
            LivestockRepository livestockRepository,
            VetVisitRepository vetVisitRepository,
            VaccinationRepository vaccinationRepository,
            MedicationRepository medicationRepository,
            MilkBatchRepository milkBatchRepository,
            QrCodeRepository qrCodeRepository,
            SequenceGeneratorService sequenceGeneratorService,
            @Value("${app.bootstrap.admin.enabled:true}") boolean enabled,
            @Value("${app.bootstrap.admin.email:admin@agritrust.com}") String email,
            @Value("${app.bootstrap.admin.password:password}") String password,
            @Value("${app.bootstrap.admin.full-name:System Admin}") String fullName) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.farmRepository = farmRepository;
        this.livestockRepository = livestockRepository;
        this.vetVisitRepository = vetVisitRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.medicationRepository = medicationRepository;
        this.milkBatchRepository = milkBatchRepository;
        this.qrCodeRepository = qrCodeRepository;
        this.sequenceGeneratorService = sequenceGeneratorService;
        this.enabled = enabled;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    public void bootstrapAdminIfNeeded() {
        if (!enabled) {
            return;
        }

        // 1. Create Admin Account
        if (!userRepository.existsByEmail(email)) {
            try {
                userService.createUser(new UserCreateRequest(fullName, email, password, Role.ADMIN));
                log.info("Bootstrap ADMIN account created ({}).", email);
            } catch (BusinessRuleException ex) {
                log.warn("Admin bootstrap error: {}", ex.getMessage());
            }
        }

        // 2. Create Farmer Account
        User farmerUser = userRepository.findByEmail("farmer@agritrust.com").orElse(null);
        if (farmerUser == null) {
            try {
                userService.createUser(new UserCreateRequest("Farmer Rajesh", "farmer@agritrust.com", "password", Role.FARMER));
                farmerUser = userRepository.findByEmail("farmer@agritrust.com").orElse(null);
                log.info("Bootstrap FARMER account created (farmer@agritrust.com).");
            } catch (Exception ex) {
                log.warn("Farmer bootstrap error: {}", ex.getMessage());
            }
        }

        // 3. Create Vet Account
        User vetUser = userRepository.findByEmail("vet@agritrust.com").orElse(null);
        if (vetUser == null) {
            try {
                userService.createUser(new UserCreateRequest("Dr. Ananya (Vet)", "vet@agritrust.com", "password", Role.VET));
                vetUser = userRepository.findByEmail("vet@agritrust.com").orElse(null);
                log.info("Bootstrap VET account created (vet@agritrust.com).");
            } catch (Exception ex) {
                log.warn("Vet bootstrap error: {}", ex.getMessage());
            }
        }

        // 4. Seed Primary Farm for Farmer Rajesh
        Farm farm = farmRepository.findByOwnerId(farmerUser.getId()).stream().findFirst().orElse(null);
        if (farm == null) {
            Farm newFarm = Farm.builder()
                    .name("Green Meadows Dairy Farm")
                    .location("Anand, Gujarat")
                    .owner(farmerUser)
                    .build();
            newFarm.setId(sequenceGeneratorService.generateSequence(Farm.class.getSimpleName()));
            farm = farmRepository.save(newFarm);
            log.info("Bootstrap Farm created: Green Meadows Dairy Farm for farmer@agritrust.com");
        }

        // 5. Seed Livestock
        Livestock cow1 = livestockRepository.findByFarmIdAndTagNumber(farm.getId(), "COW-101").orElse(null);
        if (cow1 == null) {
            cow1 = Livestock.builder()
                    .tagNumber("COW-101")
                    .species(Species.COW)
                    .dateOfBirth(LocalDate.now().minusYears(2))
                    .status(LivestockStatus.ACTIVE)
                    .farm(farm)
                    .build();
            cow1.setId(sequenceGeneratorService.generateSequence(Livestock.class.getSimpleName()));
            cow1 = livestockRepository.save(cow1);
        }

        Livestock cow2 = livestockRepository.findByFarmIdAndTagNumber(farm.getId(), "COW-102").orElse(null);
        if (cow2 == null) {
            cow2 = Livestock.builder()
                    .tagNumber("COW-102")
                    .species(Species.COW)
                    .dateOfBirth(LocalDate.now().minusYears(1))
                    .status(LivestockStatus.ACTIVE)
                    .farm(farm)
                    .build();
            cow2.setId(sequenceGeneratorService.generateSequence(Livestock.class.getSimpleName()));
            cow2 = livestockRepository.save(cow2);
        }

        Livestock goat1 = livestockRepository.findByFarmIdAndTagNumber(farm.getId(), "GOAT-301").orElse(null);
        if (goat1 == null) {
            goat1 = Livestock.builder()
                    .tagNumber("GOAT-301")
                    .species(Species.GOAT)
                    .dateOfBirth(LocalDate.now().minusMonths(8))
                    .status(LivestockStatus.ACTIVE)
                    .farm(farm)
                    .build();
            goat1.setId(sequenceGeneratorService.generateSequence(Livestock.class.getSimpleName()));
            livestockRepository.save(goat1);
            log.info("Bootstrap Goat created: GOAT-301");
        }

        // 6. Seed Demo Vet Visits
        if (vetVisitRepository.findByLivestockId(cow1.getId()).isEmpty()) {
            VetVisit visit1 = VetVisit.builder()
                    .livestock(cow1)
                    .requestedBy(farmerUser)
                    .vet(vetUser)
                    .preferredDate(LocalDate.now())
                    .reason("Annual Vaccination & Routine Checkup")
                    .notes("Animal is healthy. Administered Foot & Mouth Vaccine.")
                    .status(VetVisitStatus.COMPLETED)
                    .completedAt(LocalDateTime.now().minusHours(2))
                    .build();
            visit1.setId(sequenceGeneratorService.generateSequence(VetVisit.class.getSimpleName()));
            vetVisitRepository.save(visit1);

            VetVisit visit2 = VetVisit.builder()
                    .livestock(cow2)
                    .requestedBy(farmerUser)
                    .vet(vetUser)
                    .preferredDate(LocalDate.now().plusDays(1))
                    .reason("Mastitis Screening & Antibiotic Check")
                    .notes("Pending physical checkup.")
                    .status(VetVisitStatus.ACCEPTED)
                    .build();
            visit2.setId(sequenceGeneratorService.generateSequence(VetVisit.class.getSimpleName()));
            vetVisitRepository.save(visit2);
            log.info("Bootstrap Demo Vet Visits created.");
        }

        // 7. Seed Demo Treatments (Vaccinations & Medications)
        if (vaccinationRepository.findByLivestockId(cow1.getId()).isEmpty()) {
            Vaccination vac = Vaccination.builder()
                    .livestock(cow1)
                    .administeredBy(vetUser)
                    .vaccineName("FMD Vaccine (Foot & Mouth)")
                    .administeredDate(LocalDate.now().minusDays(10))
                    .withdrawalEndDate(LocalDate.now().minusDays(1)) // Cleared for milk batch!
                    .build();
            vac.setId(sequenceGeneratorService.generateSequence(Vaccination.class.getSimpleName()));
            vaccinationRepository.save(vac);
        }

        if (medicationRepository.findByLivestockId(cow2.getId()).isEmpty()) {
            Medication med = Medication.builder()
                    .livestock(cow2)
                    .administeredBy(vetUser)
                    .medicationName("Amoxicillin Injection 10ml")
                    .dosage("10ml IM")
                    .administeredDate(LocalDate.now().minusDays(14))
                    .withdrawalEndDate(LocalDate.now().minusDays(2))
                    .build();
            med.setId(sequenceGeneratorService.generateSequence(Medication.class.getSimpleName()));
            medicationRepository.save(med);
            log.info("Bootstrap Demo Treatments created.");
        }

        // 8. Seed Demo Milk Batch & QR Code
        if (milkBatchRepository.findByFarmId(farm.getId()).isEmpty()) {
            MilkBatch batch = MilkBatch.builder()
                    .batchCode("BATCH-2026-0819-01")
                    .farm(farm)
                    .collectedBy(farmerUser)
                    .collectionDate(LocalDate.now())
                    .quantityLitres(new BigDecimal("250.0"))
                    .livestock(Set.of(cow1))
                    .build();
            batch.setId(sequenceGeneratorService.generateSequence(MilkBatch.class.getSimpleName()));
            MilkBatch savedBatch = milkBatchRepository.save(batch);

            QrCode qr = QrCode.builder()
                    .token("AGRI-TRACE-DEMO-TOKEN-8888")
                    .milkBatch(savedBatch)
                    .build();
            qr.setId(sequenceGeneratorService.generateSequence(QrCode.class.getSimpleName()));
            qrCodeRepository.save(qr);
            log.info("Bootstrap Demo Milk Batch & QR Code created.");
        }
    }
}
