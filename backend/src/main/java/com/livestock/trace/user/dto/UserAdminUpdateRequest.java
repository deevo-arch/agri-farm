package com.livestock.trace.user.dto;

import com.livestock.trace.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// ADMIN-only edit of another (or their own) account: fullName, email, and role. Password is
// deliberately absent — this form never touches it.
public record UserAdminUpdateRequest(
        @NotBlank String fullName, @NotBlank @Email String email, @NotNull Role role) {}
