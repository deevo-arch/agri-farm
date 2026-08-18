package com.livestock.trace.treatment;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.livestock.trace.farm.FarmService;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.livestock.Species;
import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockResponse;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

// Covers the treatment-ownership requirement: administeredBy must always be the authenticated
// VET, never a client-supplied value, even if the client tries to smuggle one in.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TreatmentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private LivestockService livestockService;
    @Autowired private JwtService jwtService;

    private Long livestockId;
    private String vetAAuthHeader;
    private String vetAName;
    private Long vetBId;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private String authHeaderFor(UserResponse user) {
        return "Bearer " + jwtService.generateToken(userService.getById(user.id()));
    }

    @BeforeEach
    void setUp() {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Treatment Farmer", uniqueEmail("farmer"), "pass1234", Role.FARMER));
        AuthenticatedUser farmerPrincipal = new AuthenticatedUser(farmer.id(), farmer.email(), Role.FARMER);
        FarmResponse farm = farmService.createFarm(new FarmCreateRequest("Farm", "Somewhere", farmer.id()));
        LivestockResponse cow =
                livestockService.createLivestock(
                        new LivestockCreateRequest("TC-1", Species.COW, LocalDate.of(2022, 1, 1), farm.id()),
                        farmerPrincipal);
        livestockId = cow.id();

        UserResponse vetA =
                userService.createUser(new UserCreateRequest("Dr Vet A", uniqueEmail("vet-a"), "pass1234", Role.VET));
        vetAAuthHeader = authHeaderFor(vetA);
        vetAName = vetA.fullName();

        UserResponse vetB =
                userService.createUser(new UserCreateRequest("Dr Vet B", uniqueEmail("vet-b"), "pass1234", Role.VET));
        vetBId = vetB.id();
    }

    @Test
    void vaccination_usesAuthenticatedVetAsAdministeredBy() throws Exception {
        String body =
                """
                {"livestockId": %d, "vaccineName": "FMD", "administeredDate": "2026-08-01", "withdrawalEndDate": "2026-08-05"}
                """
                        .formatted(livestockId);

        mockMvc
                .perform(
                        post("/api/vaccinations")
                                .header(HttpHeaders.AUTHORIZATION, vetAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.administeredByName").value(vetAName));
    }

    @Test
    void vaccination_cannotAttributeTreatmentToAnotherVet() throws Exception {
        // Client tries to smuggle in another vet's id via a field the DTO no longer declares.
        String body =
                """
                {"livestockId": %d, "administeredById": %d, "vaccineName": "FMD", "administeredDate": "2026-08-01", "withdrawalEndDate": "2026-08-05"}
                """
                        .formatted(livestockId, vetBId);

        mockMvc
                .perform(
                        post("/api/vaccinations")
                                .header(HttpHeaders.AUTHORIZATION, vetAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.administeredByName").value(vetAName))
                .andExpect(jsonPath("$.administeredById").value(org.hamcrest.Matchers.not(vetBId)));
    }

    @Test
    void medication_usesAuthenticatedVetAsAdministeredBy() throws Exception {
        String body =
                """
                {"livestockId": %d, "medicationName": "Amoxicillin", "dosage": "5ml", "administeredDate": "2026-08-01", "withdrawalEndDate": "2026-08-05"}
                """
                        .formatted(livestockId);

        mockMvc
                .perform(
                        post("/api/medications")
                                .header(HttpHeaders.AUTHORIZATION, vetAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.administeredByName").value(vetAName));
    }
}
