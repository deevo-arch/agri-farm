package com.livestock.trace.auth;

import com.livestock.trace.auth.dto.LoginRequest;
import com.livestock.trace.auth.dto.LoginResponse;
import com.livestock.trace.common.exception.InvalidCredentialsException;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user =
                userRepository
                        .findByEmail(request.email())
                        .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Bearer", user.getId(), user.getFullName(), user.getRole());
    }
}
