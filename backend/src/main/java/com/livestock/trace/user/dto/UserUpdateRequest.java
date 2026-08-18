package com.livestock.trace.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Profile self-edit: fullName and email only. Role/password are never changed through this DTO.
public record UserUpdateRequest(@NotBlank String fullName, @NotBlank @Email String email) {}
