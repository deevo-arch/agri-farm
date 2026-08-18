package com.livestock.trace.bootstrap;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// CommandLineRunner is the standard Spring Boot hook for "run once after the application context
// (including the DataSource/Hibernate) is fully initialized" — exactly the timing this needs, and
// it's a well-known convention rather than a new abstraction. Kept intentionally thin: all the
// actual decision logic lives in AdminBootstrapService so it can be unit-tested directly without
// spinning up a full application startup per test case.
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {

    private final AdminBootstrapService adminBootstrapService;

    @Override
    public void run(String... args) {
        adminBootstrapService.bootstrapAdminIfNeeded();
    }
}
