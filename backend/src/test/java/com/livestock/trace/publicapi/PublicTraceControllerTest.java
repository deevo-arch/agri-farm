package com.livestock.trace.publicapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.livestock.trace.qr.QrCodeService;
import com.livestock.trace.qr.dto.QrCodeResponse;
import com.livestock.trace.security.AuthenticatedUser;
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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PublicTraceControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private LivestockService livestockService;
    @Autowired private MilkBatchService milkBatchService;
    @Autowired private TreatmentService treatmentService;
    @Autowired private QrCodeService qrCodeService;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private String uniqueBatchCode() {
        return "TRACE-" + System.nanoTime();
    }

    private String buildScenarioAndGetToken() {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Trace Farmer", uniqueEmail("farmer"), "pass1234", Role.FARMER));
        AuthenticatedUser farmerPrincipal = new AuthenticatedUser(farmer.id(), farmer.email(), Role.FARMER);
        UserResponse vet =
                userService.createUser(
                        new UserCreateRequest("Trace Vet", uniqueEmail("vet"), "pass1234", Role.VET));
        AuthenticatedUser vetPrincipal = new AuthenticatedUser(vet.id(), vet.email(), Role.VET);
        FarmResponse farm =
                farmService.createFarm(new FarmCreateRequest("Trace Farm", "Trace Location", farmer.id()));
        LivestockResponse cow =
                livestockService.createLivestock(
                        new LivestockCreateRequest("TR-1", Species.COW, LocalDate.of(2022, 1, 1), farm.id()),
                        farmerPrincipal);

        treatmentService.createVaccination(
                new VaccinationCreateRequest(
                        cow.id(), null, "FMD", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5)),
                vetPrincipal);
        treatmentService.createMedication(
                new MedicationCreateRequest(
                        cow.id(),
                        null,
                        "Antibiotic",
                        "5ml",
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 1, 3)),
                vetPrincipal);

        MilkBatchResponse batch =
                milkBatchService.createMilkBatch(
                        new MilkBatchCreateRequest(
                                uniqueBatchCode(),
                                farm.id(),
                                farmer.id(),
                                LocalDate.of(2026, 1, 10),
                                new BigDecimal("12.00"),
                                Set.of(cow.id())),
                        farmerPrincipal);

        QrCodeResponse qr = qrCodeService.generateForMilkBatch(batch.id(), farmerPrincipal);
        return qr.token();
    }

    @Test
    void publicTrace_worksWithoutJwt() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc.perform(get("/api/public/trace/" + token)).andExpect(status().isOk());
    }

    @Test
    void validToken_returnsCorrectMilkBatch() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milkBatch.collectionDate").value("2026-01-10"))
                .andExpect(jsonPath("$.milkBatch.quantityLitres").value(12.00));
    }

    @Test
    void validToken_returnsLivestockInformation() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.livestock[0].tagNumber").value("TR-1"))
                .andExpect(jsonPath("$.livestock[0].species").value("COW"));
    }

    @Test
    void validToken_returnsFarmInformation() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.farm.name").value("Trace Farm"))
                .andExpect(jsonPath("$.farm.location").value("Trace Location"));
    }

    @Test
    void validToken_returnsVaccinationHistory() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vaccinations[0].vaccineName").value("FMD"))
                .andExpect(jsonPath("$.vaccinations[0].vetName").value("Trace Vet"));
    }

    @Test
    void validToken_returnsMedicationHistory() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medications[0].medicationName").value("Antibiotic"))
                .andExpect(jsonPath("$.medications[0].vetName").value("Trace Vet"));
    }

    @Test
    void invalidToken_returns404() throws Exception {
        mockMvc.perform(get("/api/public/trace/this-token-does-not-exist")).andExpect(status().isNotFound());
    }

    @Test
    void publicResponse_doesNotExposeSensitiveInformation() throws Exception {
        String token = buildScenarioAndGetToken();

        mockMvc
                .perform(get("/api/public/trace/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$..password").doesNotExist())
                .andExpect(jsonPath("$.farm.email").doesNotExist())
                .andExpect(jsonPath("$.livestock[0].id").doesNotExist())
                .andExpect(jsonPath("$.milkBatch.id").doesNotExist());
    }
}
