package com.livestock.trace.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FarmCreateRequest(
        @NotBlank String name,
        @NotBlank String location,
        @NotNull Long ownerId) {}
