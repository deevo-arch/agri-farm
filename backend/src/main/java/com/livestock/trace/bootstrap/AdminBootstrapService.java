package com.livestock.trace.bootstrap;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserRepository;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Dev-only convenience for a fresh database: public registration can only ever create a FARMER,
// and creating a VET/ADMIN requires an existing ADMIN's JWT (POST /api/users). Without this,
// nobody could ever reach VET/ADMIN on a clean database. Disabled by default; see application.yml
// (app.bootstrap.admin.*) for the environment variables that enable it.
@Slf4j
@Service
public class AdminBootstrapService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final boolean enabled;
    private final String email;
    private final String password;
    private final String fullName;

    public AdminBootstrapService(
            UserRepository userRepository,
            UserService userService,
            @Value("${app.bootstrap.admin.enabled:false}") boolean enabled,
            @Value("${app.bootstrap.admin.email:}") String email,
            @Value("${app.bootstrap.admin.password:}") String password,
            @Value("${app.bootstrap.admin.full-name:Bootstrap Admin}") String fullName) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.enabled = enabled;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    public void bootstrapAdminIfNeeded() {
        if (!enabled) {
            return;
        }
        if (userRepository.existsByRole(Role.ADMIN)) {
            log.info("Admin bootstrap skipped: an ADMIN account already exists.");
            return;
        }
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.warn(
                    "Admin bootstrap enabled but BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD are not set;"
                            + " skipping.");
            return;
        }

        try {
            userService.createUser(new UserCreateRequest(fullName, email, password, Role.ADMIN));
            log.info("Bootstrap ADMIN account created ({}).", email);
        } catch (BusinessRuleException ex) {
            // Most likely the email collides with an existing non-admin account. Don't fail
            // application startup over a bootstrap convenience feature.
            log.warn("Admin bootstrap could not create account for {}: {}", email, ex.getMessage());
        }
    }
}
