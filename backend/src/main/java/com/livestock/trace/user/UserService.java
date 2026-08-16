package com.livestock.trace.user;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getById(Long id) {
        return userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public User getByEmail(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public UserResponse getResponseById(Long id) {
        return UserResponse.from(getById(id));
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email already registered: " + request.email());
        }
        User user =
                User.builder()
                        .fullName(request.fullName())
                        .email(request.email())
                        .password(passwordEncoder.encode(request.password()))
                        .role(request.role())
                        .build();
        return UserResponse.from(userRepository.save(user));
    }
}
