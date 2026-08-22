package com.livestock.trace.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;

import com.livestock.trace.common.SequenceGeneratorService;
import com.livestock.trace.farm.FarmRepository;
import com.livestock.trace.livestock.LivestockRepository;
import com.livestock.trace.milk.MilkBatchRepository;
import com.livestock.trace.qr.QrCodeRepository;
import com.livestock.trace.treatment.MedicationRepository;
import com.livestock.trace.treatment.VaccinationRepository;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserRepository;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.vet.VetVisitRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

// Full startup (CommandLineRunner) isn't exercised here on purpose: constructing
// AdminBootstrapService directly with explicit enabled/email/password lets each scenario be
// tested in isolation without booting the context multiple times or fighting Spring's property
// resolution. The runner itself (AdminBootstrapRunner) is a one-line delegation with nothing of
// its own to test.
@SpringBootTest
@Transactional
class AdminBootstrapServiceTest {

    @Autowired private UserRepository userRepository;
    @Autowired private UserService userService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private FarmRepository farmRepository;
    @Autowired private LivestockRepository livestockRepository;
    @Autowired private VetVisitRepository vetVisitRepository;
    @Autowired private VaccinationRepository vaccinationRepository;
    @Autowired private MedicationRepository medicationRepository;
    @Autowired private MilkBatchRepository milkBatchRepository;
    @Autowired private QrCodeRepository qrCodeRepository;
    @Autowired private SequenceGeneratorService sequenceGeneratorService;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    // Guarantees the "no ADMIN exists" precondition within a test's own rolled-back transaction,
    // regardless of what the shared dev database already contains.
    private void clearExistingAdmins() {
        userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .forEach(userRepository::delete);
    }

    private AdminBootstrapService createService(boolean enabled, String email, String password, String fullName) {
        return new AdminBootstrapService(
                userRepository, userService,
                farmRepository, livestockRepository,
                vetVisitRepository, vaccinationRepository,
                medicationRepository, milkBatchRepository,
                qrCodeRepository, sequenceGeneratorService,
                enabled, email, password, fullName);
    }

    @Test
    void bootstrap_createsAdmin_whenEnabledAndNoAdminExists() {
        clearExistingAdmins();

        String email = uniqueEmail("bootstrap-admin");
        AdminBootstrapService service = createService(true, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        User created = userRepository.findByEmail(email).orElseThrow();
        assertThat(created.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void bootstrap_doesNothing_whenAdminAlreadyExists() {
        userService.createUser(
                new UserCreateRequest("Existing Admin", uniqueEmail("existing-admin"), "pass1234", Role.ADMIN));

        String email = uniqueEmail("should-not-be-created");
        AdminBootstrapService service = createService(true, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }

    @Test
    void bootstrap_storesPasswordHashed() {
        clearExistingAdmins();

        String email = uniqueEmail("bootstrap-hash");
        AdminBootstrapService service = createService(true, email, "plainTextPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        User created = userRepository.findByEmail(email).orElseThrow();
        assertThat(created.getPassword()).isNotEqualTo("plainTextPass1");
        assertThat(passwordEncoder.matches("plainTextPass1", created.getPassword())).isTrue();
    }

    @Test
    void bootstrap_doesNothing_whenDisabled() {
        String email = uniqueEmail("disabled-admin");
        AdminBootstrapService service = createService(false, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }
}
