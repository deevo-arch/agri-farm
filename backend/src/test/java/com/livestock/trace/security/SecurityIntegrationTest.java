package com.livestock.trace.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.auth.dto.LoginRequest;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.treatment.dto.VaccinationCreateRequest;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;

    private record Session(String token, Long userId) {}

    // Seeds via UserService, not POST /api/auth/register, since public registration only ever creates a FARMER.
    private Session registerAndLogin(Role role) throws Exception {
        String email = role.name().toLowerCase() + "-" + System.nanoTime() + "@test.local";
        UserResponse created =
                userService.createUser(new UserCreateRequest("Test " + role, email, "password123", role));
        long userId = created.id();

        String loginBody = objectMapper.writeValueAsString(new LoginRequest(email, "password123"));
        MvcResult loginResult =
                mockMvc
                        .perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginBody))
                        .andExpect(status().isOk())
                        .andReturn();
        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());

        return new Session(loginJson.get("token").asText(), userId);
    }

    @Test
    void protectedEndpoint_rejectsRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_acceptsValidToken() throws Exception {
        Session farmer = registerAndLogin(Role.FARMER);

        mockMvc
                .perform(
                        get("/api/users/" + farmer.userId())
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + farmer.token()))
                .andExpect(status().isOk());
    }

    @Test
    void farmer_cannotCreateVaccination() throws Exception {
        Session farmer = registerAndLogin(Role.FARMER);
        VaccinationCreateRequest request =
                new VaccinationCreateRequest(1L, null, 1L, "Test Vaccine", LocalDate.now(), LocalDate.now());

        mockMvc
                .perform(
                        post("/api/vaccinations")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + farmer.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void vet_cannotCreateFarm() throws Exception {
        Session vet = registerAndLogin(Role.VET);
        FarmCreateRequest request = new FarmCreateRequest("Vet's Farm", "Nowhere", vet.userId());

        mockMvc
                .perform(
                        post("/api/farms")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + vet.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canAccessProtectedApis() throws Exception {
        Session admin = registerAndLogin(Role.ADMIN);

        mockMvc
                .perform(
                        get("/api/users/" + admin.userId())
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + admin.token()))
                .andExpect(status().isOk());

        FarmCreateRequest farmRequest = new FarmCreateRequest("Admin Farm", "Somewhere", admin.userId());
        mockMvc
                .perform(
                        post("/api/farms")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + admin.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(farmRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void publicAuthEndpoints_remainAccessibleWithoutToken() throws Exception {
        UserCreateRequest register =
                new UserCreateRequest(
                        "No Token Needed", "public-" + System.nanoTime() + "@test.local", "pass1234", Role.FARMER);

        mockMvc
                .perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());
    }
}
