package com.livestock.trace.user;

import com.livestock.trace.common.exception.BusinessRuleException;
import com.livestock.trace.common.exception.ResourceNotFoundException;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.user.dto.UserAdminUpdateRequest;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import com.livestock.trace.user.dto.UserUpdateRequest;
import java.util.List;
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

    @Transactional(readOnly = true)
    public List<UserResponse> getAllResponses() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse updateSelf(Long userId, UserUpdateRequest request) {
        User user = getById(userId);
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(request.email());
        if (emailChanged && userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email already registered: " + request.email());
        }
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        return UserResponse.from(userRepository.save(user));
    }

    // ADMIN-only: can edit any account's fullName/email/role, including their own — except an
    // admin can never demote themselves away from ADMIN, to avoid locking the system out.
    @Transactional
    public UserResponse updateUserAsAdmin(
            Long targetUserId, UserAdminUpdateRequest request, AuthenticatedUser currentUser) {
        User user = getById(targetUserId);
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(request.email());
        if (emailChanged && userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email already registered: " + request.email());
        }
        boolean isSelf = currentUser.id().equals(targetUserId);
        if (isSelf && request.role() != Role.ADMIN) {
            throw new BusinessRuleException("You cannot remove your own admin role.");
        }
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
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
