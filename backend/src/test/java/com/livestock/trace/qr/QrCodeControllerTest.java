package com.livestock.trace.qr;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
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
import com.livestock.trace.milk.MilkBatchService;
import com.livestock.trace.milk.dto.MilkBatchCreateRequest;
import com.livestock.trace.milk.dto.MilkBatchResponse;
import com.livestock.trace.security.JwtService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QrCodeControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private LivestockService livestockService;
    @Autowired private MilkBatchService milkBatchService;
    @Autowired private JwtService jwtService;
    @Autowired private QrCodeRepository qrCodeRepository;

    private Long farmerId;
    private String farmerAuthHeader;
    private Long farmId;
    private Long milkBatchId;

    @BeforeEach
    void setUp() {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("QR Farmer", uniqueEmail("farmer"), "pass1234", Role.FARMER));
        farmerId = farmer.id();
        farmerAuthHeader = "Bearer " + jwtService.generateToken(userService.getById(farmerId));

        FarmResponse farm =
                farmService.createFarm(new FarmCreateRequest("QR Test Farm", "Testville", farmerId));
        farmId = farm.id();

        LivestockResponse cow =
                livestockService.createLivestock(
                        new LivestockCreateRequest("QRT-1", Species.COW, LocalDate.of(2022, 1, 1), farmId));

        MilkBatchResponse batch =
                milkBatchService.createMilkBatch(
                        new MilkBatchCreateRequest(
                                uniqueBatchCode(),
                                farmId,
                                farmerId,
                                LocalDate.now(),
                                new BigDecimal("10.00"),
                                Set.of(cow.id())));
        milkBatchId = batch.id();
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private String uniqueBatchCode() {
        return "QRTEST-" + System.nanoTime();
    }

    private String tokenFor(Role role) {
        UserResponse user =
                userService.createUser(
                        new UserCreateRequest("QR " + role, uniqueEmail(role.name().toLowerCase()), "pass1234", role));
        return "Bearer " + jwtService.generateToken(userService.getById(user.id()));
    }

    @Test
    void farmer_canGenerateQr() throws Exception {
        mockMvc
                .perform(post("/api/milk-batches/" + milkBatchId + "/qr").header(HttpHeaders.AUTHORIZATION, farmerAuthHeader))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.milkBatchId").value(milkBatchId))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.traceUrl", startsWith("http://localhost:3000/trace/")))
                .andExpect(jsonPath("$.qrImage", startsWith("data:image/png;base64,")));
    }

    @Test
    void admin_canGenerateQr() throws Exception {
        String adminAuthHeader = tokenFor(Role.ADMIN);

        mockMvc
                .perform(post("/api/milk-batches/" + milkBatchId + "/qr").header(HttpHeaders.AUTHORIZATION, adminAuthHeader))
                .andExpect(status().isCreated());
    }

    @Test
    void unauthenticated_cannotGenerateQr() throws Exception {
        mockMvc.perform(post("/api/milk-batches/" + milkBatchId + "/qr")).andExpect(status().isUnauthorized());
    }

    @Test
    void vet_cannotGenerateFarmerQr() throws Exception {
        String vetAuthHeader = tokenFor(Role.VET);

        mockMvc
                .perform(post("/api/milk-batches/" + milkBatchId + "/qr").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isForbidden());
    }

    @Test
    void repeatedGeneration_doesNotCreateDuplicateRecords() throws Exception {
        mockMvc
                .perform(post("/api/milk-batches/" + milkBatchId + "/qr").header(HttpHeaders.AUTHORIZATION, farmerAuthHeader))
                .andExpect(status().isCreated());

        mockMvc
                .perform(post("/api/milk-batches/" + milkBatchId + "/qr").header(HttpHeaders.AUTHORIZATION, farmerAuthHeader))
                .andExpect(status().isOk());

        assertThat(qrCodeRepository.findByMilkBatchId(milkBatchId)).isPresent();
        long total =
                qrCodeRepository.findAll().stream()
                        .filter(q -> q.getMilkBatch().getId().equals(milkBatchId))
                        .count();
        assertThat(total).isEqualTo(1);
    }

    @Test
    void generatedToken_isUniqueAndOpaque() throws Exception {
        MvcResult firstResult =
                mockMvc
                        .perform(
                                post("/api/milk-batches/" + milkBatchId + "/qr")
                                        .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader))
                        .andExpect(status().isCreated())
                        .andReturn();
        String firstToken =
                objectMapper.readTree(firstResult.getResponse().getContentAsString()).get("token").asText();

        LivestockResponse cow2 =
                livestockService.createLivestock(
                        new LivestockCreateRequest("QRT-2", Species.COW, LocalDate.of(2022, 1, 1), farmId));
        MilkBatchResponse batch2 =
                milkBatchService.createMilkBatch(
                        new MilkBatchCreateRequest(
                                uniqueBatchCode(),
                                farmId,
                                farmerId,
                                LocalDate.now(),
                                new BigDecimal("5.00"),
                                Set.of(cow2.id())));

        MvcResult secondResult =
                mockMvc
                        .perform(
                                post("/api/milk-batches/" + batch2.id() + "/qr")
                                        .header(HttpHeaders.AUTHORIZATION, farmerAuthHeader))
                        .andExpect(status().isCreated())
                        .andReturn();
        String secondToken =
                objectMapper.readTree(secondResult.getResponse().getContentAsString()).get("token").asText();

        assertThat(firstToken).isNotEqualTo(secondToken);
        assertThat(firstToken.length()).isGreaterThanOrEqualTo(32);
        assertThat(firstToken).doesNotContain(milkBatchId.toString());
        assertThat(firstToken).doesNotContain(farmerId.toString());
    }
}
