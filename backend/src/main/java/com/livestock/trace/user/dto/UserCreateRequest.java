package com.livestock.trace.user.dto;

import com.livestock.trace.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCreateRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull Role role) {}
