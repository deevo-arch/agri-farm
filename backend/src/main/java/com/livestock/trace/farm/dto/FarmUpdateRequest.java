package com.livestock.trace.farm.dto;

import jakarta.validation.constraints.NotBlank;

public record FarmUpdateRequest(@NotBlank String name, @NotBlank String location) {}
