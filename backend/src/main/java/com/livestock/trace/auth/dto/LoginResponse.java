package com.livestock.trace.auth.dto;

import com.livestock.trace.user.Role;

public record LoginResponse(String token, String tokenType, Long userId, String name, Role role) {}
