package com.livestock.trace.milk;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.farm.FarmService;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.farm.dto.FarmResponse;
import com.livestock.trace.livestock.LivestockService;
import com.livestock.trace.livestock.Species;
import com.livestock.trace.livestock.dto.LivestockCreateRequest;
import com.livestock.trace.livestock.dto.LivestockResponse;
import com.livestock.trace.milk.dto.MilkBatchCreateRequest;
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.treatment.TreatmentService;
import com.livestock.trace.treatment.dto.MedicationCreateRequest;
import com.livestock.trace.treatment.dto.VaccinationCreateRequest;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MilkBatchControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private LivestockService livestockService;
    @Autowired private TreatmentService treatmentService;
    @Autowired private JwtService jwtService;

    private Long farmerId;
    private Long farmId;
    private String farmerAuthHeader;
    private AuthenticatedUser farmerPrincipal;
    private AuthenticatedUser vetPrincipal;

    @BeforeEach
    void setUp() {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Farmer Joe", uniqueEmail("farmer"), "pass", Role.FARMER));
        UserResponse vet =
                userService.createUser(
                        new UserCreateRequest("Dr Vet", uniqueEmail("vet"), "pass", Role.VET));
        FarmResponse farm =
                farmService.createFarm(new FarmCreateRequest("Test Farm", "Testville", farmer.id()));

        farmerId = farmer.id();
        farmId = farm.id();
        farmerAuthHeader = "Bearer " + jwtService.generateToken(userService.getById(farmerId));
        farmerPrincipal = new AuthenticatedUser(farmer.id(), farmer.email(), Role.FARMER);
        vetPrincipal = new AuthenticatedUser(vet.id(), vet.email(), Role.VET);
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private Long createLivestock(String tag) {
        LivestockResponse livestock =
                livestockService.createLivestock(
                        new LivestockCreateRequest(tag, Species.COW, LocalDate.of(2022, 1, 1), farmId),
                        farmerPrincipal);
        return livestock.id();
    }

    @Test
    void createsSuccessfully_whenNoWithdrawal() throws Exception {
        Long cowId = createLivestock("COW-1");
        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-1",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 10),
                        new BigDecimal("10.00"),
                        Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.batchCode").value("BATCH-1"));
    }

    @Test
    void rejects_whenVaccinationWithdrawalActive() throws Exception {
        Long cowId = createLivestock("COW-2");
        treatmentService.createVaccination(
                new VaccinationCreateRequest(
                        cowId, null, "FMD", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 15)),
                vetPrincipal);

        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-2",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 15),
                        new BigDecimal("10.00"),
                        Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void rejects_whenMedicationWithdrawalActive() throws Exception {
        Long cowId = createLivestock("COW-3");
        treatmentService.createMedication(
                new MedicationCreateRequest(
                        cowId,
                        null,
                        "Antibiotic",
                        "10ml",
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 1, 20)),
                vetPrincipal);

        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-3",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 20),
                        new BigDecimal("10.00"),
                        Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void createsSuccessfully_whenWithdrawalExpired() throws Exception {
        Long cowId = createLivestock("COW-4");
        treatmentService.createVaccination(
                new VaccinationCreateRequest(
                        cowId, null, "FMD", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 10)),
                vetPrincipal);

        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-4",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 11),
                        new BigDecimal("10.00"),
                        Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void rejects_whenLivestockDoesNotExist() throws Exception {
        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-5",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 10),
                        new BigDecimal("10.00"),
                        Set.of(999999L));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejects_whenQuantityIsZeroOrNegative() throws Exception {
        Long cowId = createLivestock("COW-6");
        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-6", farmId, farmerId, LocalDate.of(2026, 1, 10), BigDecimal.ZERO, Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejects_whenBatchCodeIsDuplicate() throws Exception {
        Long cowId1 = createLivestock("COW-7A");
        Long cowId2 = createLivestock("COW-7B");

        MilkBatchCreateRequest first =
                new MilkBatchCreateRequest(
                        "DUP-CODE",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 10),
                        new BigDecimal("5.00"),
                        Set.of(cowId1));
        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        MilkBatchCreateRequest second =
                new MilkBatchCreateRequest(
                        "DUP-CODE",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 11),
                        new BigDecimal("5.00"),
                        Set.of(cowId2));
        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isConflict());
    }

    @Test
    void rejects_whenFarmBelongsToAnotherFarmer() throws Exception {
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));
        FarmResponse farmB =
                farmService.createFarm(new FarmCreateRequest("Farm B", "Elsewhere", farmerB.id()));
        AuthenticatedUser farmerBPrincipal = new AuthenticatedUser(farmerB.id(), farmerB.email(), Role.FARMER);
        LivestockResponse cowB =
                livestockService.createLivestock(
                        new LivestockCreateRequest("COW-B1", Species.COW, LocalDate.of(2022, 1, 1), farmB.id()),
                        farmerBPrincipal);

        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-CROSS",
                        farmB.id(),
                        farmerId,
                        LocalDate.of(2026, 1, 10),
                        new BigDecimal("10.00"),
                        Set.of(cowB.id()));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    void admin_canCreateMilkBatchForAnotherFarmersFarm() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin"), "pass1234", Role.ADMIN));
        String adminAuthHeader = "Bearer " + jwtService.generateToken(userService.getById(admin.id()));

        Long cowId = createLivestock("COW-ADMIN");
        MilkBatchCreateRequest request =
                new MilkBatchCreateRequest(
                        "BATCH-ADMIN",
                        farmId,
                        farmerId,
                        LocalDate.of(2026, 1, 10),
                        new BigDecimal("10.00"),
                        Set.of(cowId));

        mockMvc.perform(
                        post("/api/milk-batches")
                                .header(HttpHeaders.AUTHORIZATION, adminAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
