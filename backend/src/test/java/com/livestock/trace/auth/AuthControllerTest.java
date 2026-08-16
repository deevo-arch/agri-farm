package com.livestock.trace.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.auth.dto.LoginRequest;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.User;
import com.livestock.trace.user.UserRepository;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private UserService userService;
    @Autowired private PasswordEncoder passwordEncoder;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private void register(String email, String password, Role role) throws Exception {
        UserCreateRequest request = new UserCreateRequest("Test User", email, password, role);
        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void register_hashesPassword() throws Exception {
        String email = uniqueEmail("hash");
        register(email, "plainTextPass123", Role.FARMER);

        User saved = userRepository.findByEmail(email).orElseThrow();
        assertThat(saved.getPassword()).isNotEqualTo("plainTextPass123");
        assertThat(passwordEncoder.matches("plainTextPass123", saved.getPassword())).isTrue();
    }

    @Test
    void register_rejectsDuplicateEmail() throws Exception {
        String email = uniqueEmail("dup");
        register(email, "pass123", Role.FARMER);

        UserCreateRequest duplicate = new UserCreateRequest("Another Name", email, "pass456", Role.FARMER);
        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict());
    }

    @Test
    void login_succeedsWithCorrectCredentials() throws Exception {
        String email = uniqueEmail("login-ok");
        register(email, "correctPass1", Role.FARMER);

        LoginRequest login = new LoginRequest(email, "correctPass1");
        mockMvc
                .perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.role").value("FARMER"));
    }

    @Test
    void login_failsWithIncorrectPassword() throws Exception {
        String email = uniqueEmail("login-bad");
        register(email, "correctPass1", Role.FARMER);

        LoginRequest login = new LoginRequest(email, "wrongPassword");
        mockMvc
                .perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_publicRegistrationCreatesFarmer() throws Exception {
        String email = uniqueEmail("default-role");
        UserCreateRequest request = new UserCreateRequest("Default Role User", email, "pass1234", Role.FARMER);

        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("FARMER"));
    }

    @Test
    void register_cannotCreateVetEvenIfRequested() throws Exception {
        String email = uniqueEmail("try-vet");
        UserCreateRequest request = new UserCreateRequest("Try Vet", email, "pass1234", Role.VET);

        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("FARMER"));

        User saved = userRepository.findByEmail(email).orElseThrow();
        assertThat(saved.getRole()).isEqualTo(Role.FARMER);
    }

    @Test
    void register_cannotCreateAdminEvenIfRequested() throws Exception {
        String email = uniqueEmail("try-admin");
        UserCreateRequest request = new UserCreateRequest("Try Admin", email, "pass1234", Role.ADMIN);

        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("FARMER"));

        User saved = userRepository.findByEmail(email).orElseThrow();
        assertThat(saved.getRole()).isEqualTo(Role.FARMER);
    }

    @Test
    void admin_canCreateVetThroughProtectedEndpoint() throws Exception {
        String adminEmail = uniqueEmail("admin-seed");
        userService.createUser(new UserCreateRequest("Seed Admin", adminEmail, "adminPass1", Role.ADMIN));

        LoginRequest adminLogin = new LoginRequest(adminEmail, "adminPass1");
        MvcResult loginResult =
                mockMvc
                        .perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(adminLogin)))
                        .andExpect(status().isOk())
                        .andReturn();
        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        UserCreateRequest vetRequest =
                new UserCreateRequest("New Vet", uniqueEmail("created-vet"), "vetPass123", Role.VET);
        mockMvc
                .perform(
                        post("/api/users")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vetRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("VET"));
    }
}
