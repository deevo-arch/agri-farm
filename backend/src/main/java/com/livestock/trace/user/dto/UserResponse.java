package com.livestock.trace.user.dto;

import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;

public record UserResponse(Long id, String fullName, String email, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
