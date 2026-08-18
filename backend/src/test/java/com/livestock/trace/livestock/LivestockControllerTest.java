package com.livestock.trace.livestock;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockUpdateRequest;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LivestockControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private JwtService jwtService;

    private Long farmAId;
    private String farmerAAuthHeader;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private String authHeaderFor(UserResponse user) {
        return "Bearer " + jwtService.generateToken(userService.getById(user.id()));
    }

    @BeforeEach
    void setUp() {
        UserResponse farmerA =
                userService.createUser(
                        new UserCreateRequest("Farmer A", uniqueEmail("farmer-a"), "pass1234", Role.FARMER));
        farmerAAuthHeader = authHeaderFor(farmerA);

        FarmResponse farmA = farmService.createFarm(new FarmCreateRequest("Farm A", "Location A", farmerA.id()));
        farmAId = farmA.id();
    }

    @Test
    void farmer_canCreateLivestockInOwnFarm() throws Exception {
        LivestockCreateRequest request =
                new LivestockCreateRequest("COW-A1", Species.COW, LocalDate.of(2022, 1, 1), farmAId);

        mockMvc
                .perform(
                        post("/api/livestock")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tagNumber").value("COW-A1"))
                .andExpect(jsonPath("$.farmId").value(farmAId));
    }

    @Test
    void farmer_cannotCreateLivestockInAnotherFarmersFarm() throws Exception {
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));
        FarmResponse farmB = farmService.createFarm(new FarmCreateRequest("Farm B", "Location B", farmerB.id()));

        LivestockCreateRequest request =
                new LivestockCreateRequest("COW-B1", Species.COW, LocalDate.of(2022, 1, 1), farmB.id());

        mockMvc
                .perform(
                        post("/api/livestock")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    void admin_canCreateLivestockInAnotherFarmersFarm() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin"), "pass1234", Role.ADMIN));

        LivestockCreateRequest request =
                new LivestockCreateRequest("COW-ADMIN", Species.COW, LocalDate.of(2022, 1, 1), farmAId);

        mockMvc
                .perform(
                        post("/api/livestock")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.farmId").value(farmAId));
    }

    @Test
    void unauthenticated_cannotCreateLivestock() throws Exception {
        LivestockCreateRequest request =
                new LivestockCreateRequest("COW-NOAUTH", Species.COW, LocalDate.of(2022, 1, 1), farmAId);

        mockMvc
                .perform(
                        post("/api/livestock")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejects_whenTagNumberAlreadyUsedOnSameFarm() throws Exception {
        LivestockCreateRequest first =
                new LivestockCreateRequest("DUP-TAG", Species.COW, LocalDate.of(2022, 1, 1), farmAId);
        mockMvc
                .perform(
                        post("/api/livestock")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        LivestockCreateRequest duplicate =
                new LivestockCreateRequest("DUP-TAG", Species.GOAT, LocalDate.of(2023, 1, 1), farmAId);
        mockMvc
                .perform(
                        post("/api/livestock")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    private Long createLivestock(String tag) throws Exception {
        LivestockCreateRequest request =
                new LivestockCreateRequest(tag, Species.COW, LocalDate.of(2022, 1, 1), farmAId);
        MvcResult result =
                mockMvc
                        .perform(
                                post("/api/livestock")
                                        .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().isCreated())
                        .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    void farmer_canUpdateMutableFieldsOnOwnLivestock() throws Exception {
        Long id = createLivestock("EDIT-1");
        LivestockUpdateRequest update =
                new LivestockUpdateRequest(Species.GOAT, LocalDate.of(2021, 6, 1), LivestockStatus.SOLD);

        mockMvc
                .perform(
                        patch("/api/livestock/" + id)
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tagNumber").value("EDIT-1"))
                .andExpect(jsonPath("$.species").value("GOAT"))
                .andExpect(jsonPath("$.status").value("SOLD"));
    }

    @Test
    void farmer_cannotUpdateAnotherFarmersLivestock() throws Exception {
        Long id = createLivestock("EDIT-2");
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));
        LivestockUpdateRequest update =
                new LivestockUpdateRequest(Species.GOAT, LocalDate.of(2021, 6, 1), LivestockStatus.SOLD);

        mockMvc
                .perform(
                        patch("/api/livestock/" + id)
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerB))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canUpdateAnotherFarmersLivestock() throws Exception {
        Long id = createLivestock("EDIT-3");
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin"), "pass1234", Role.ADMIN));
        LivestockUpdateRequest update =
                new LivestockUpdateRequest(Species.SHEEP, LocalDate.of(2020, 1, 1), LivestockStatus.DECEASED);

        mockMvc
                .perform(
                        patch("/api/livestock/" + id)
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DECEASED"));
    }
}
