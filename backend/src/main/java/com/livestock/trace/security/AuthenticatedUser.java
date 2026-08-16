package com.livestock.trace.security;

import com.livestock.trace.user.Role;

public record AuthenticatedUser(Long id, String email, Role role) {}
