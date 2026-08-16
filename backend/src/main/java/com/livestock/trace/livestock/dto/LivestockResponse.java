package com.livestock.trace.livestock.dto;

import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.livestock.LivestockStatus;
import com.livestock.trace.livestock.Species;
import java.time.LocalDate;

public record LivestockResponse(
        Long id,
        String tagNumber,
        Species species,
        LocalDate dateOfBirth,
        LivestockStatus status,
        Long farmId,
        String farmName) {

    public static LivestockResponse from(Livestock livestock) {
        return new LivestockResponse(
                livestock.getId(),
                livestock.getTagNumber(),
                livestock.getSpecies(),
                livestock.getDateOfBirth(),
                livestock.getStatus(),
                livestock.getFarm().getId(),
                livestock.getFarm().getName());
    }
}
