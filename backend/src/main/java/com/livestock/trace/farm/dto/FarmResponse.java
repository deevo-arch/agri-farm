package com.livestock.trace.farm.dto;

import com.livestock.trace.farm.Farm;

public record FarmResponse(Long id, String name, String location, Long ownerId, String ownerName) {

    public static FarmResponse from(Farm farm) {
        return new FarmResponse(
                farm.getId(),
                farm.getName(),
                farm.getLocation(),
                farm.getOwner().getId(),
                farm.getOwner().getFullName());
    }
}
