package com.livestock.trace.auth;

import com.livestock.trace.auth.dto.LoginRequest;
import com.livestock.trace.auth.dto.LoginResponse;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserCreateRequest request) {
        // Public self-registration always creates a FARMER; any role in the request body is ignored.
        UserCreateRequest farmerRequest =
                new UserCreateRequest(request.fullName(), request.email(), request.password(), Role.FARMER);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(farmerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
