package com.livestock.trace.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;

import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserRepository;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
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

    @Test
    void bootstrap_createsAdmin_whenEnabledAndNoAdminExists() {
        clearExistingAdmins();

        String email = uniqueEmail("bootstrap-admin");
        AdminBootstrapService service =
                new AdminBootstrapService(userRepository, userService, true, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        User created = userRepository.findByEmail(email).orElseThrow();
        assertThat(created.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void bootstrap_doesNothing_whenAdminAlreadyExists() {
        userService.createUser(
                new UserCreateRequest("Existing Admin", uniqueEmail("existing-admin"), "pass1234", Role.ADMIN));

        String email = uniqueEmail("should-not-be-created");
        AdminBootstrapService service =
                new AdminBootstrapService(userRepository, userService, true, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }

    @Test
    void bootstrap_storesPasswordHashed() {
        clearExistingAdmins();

        String email = uniqueEmail("bootstrap-hash");
        AdminBootstrapService service =
                new AdminBootstrapService(userRepository, userService, true, email, "plainTextPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        User created = userRepository.findByEmail(email).orElseThrow();
        assertThat(created.getPassword()).isNotEqualTo("plainTextPass1");
        assertThat(passwordEncoder.matches("plainTextPass1", created.getPassword())).isTrue();
    }

    @Test
    void bootstrap_doesNothing_whenDisabled() {
        String email = uniqueEmail("disabled-admin");
        AdminBootstrapService service =
                new AdminBootstrapService(userRepository, userService, false, email, "bootstrapPass1", "Bootstrap Admin");

        service.bootstrapAdminIfNeeded();

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }
}
