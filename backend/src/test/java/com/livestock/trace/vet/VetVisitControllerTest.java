package com.livestock.trace.vet;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import com.livestock.trace.security.AuthenticatedUser;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import com.livestock.trace.vet.dto.VetVisitCreateRequest;
import com.livestock.trace.vet.dto.VetVisitUpdateRequest;
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
class VetVisitControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;
    @Autowired private FarmService farmService;
    @Autowired private LivestockService livestockService;
    @Autowired private JwtService jwtService;

    private String farmerAAuthHeader;
    private Long livestockAId;
    private String vetAuthHeader;

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
        AuthenticatedUser farmerAPrincipal = new AuthenticatedUser(farmerA.id(), farmerA.email(), Role.FARMER);

        FarmResponse farmA = farmService.createFarm(new FarmCreateRequest("Farm A", "Location A", farmerA.id()));
        LivestockResponse cowA =
                livestockService.createLivestock(
                        new LivestockCreateRequest("COW-A1", Species.COW, LocalDate.of(2022, 1, 1), farmA.id()),
                        farmerAPrincipal);
        livestockAId = cowA.id();

        UserResponse vet =
                userService.createUser(new UserCreateRequest("Dr Vet", uniqueEmail("vet"), "pass1234", Role.VET));
        vetAuthHeader = authHeaderFor(vet);
    }

    private String requestBody(Long livestockId) throws Exception {
        return objectMapper.writeValueAsString(
                new VetVisitCreateRequest(
                        livestockId, LocalDate.of(2026, 8, 25), "Vaccination", "FMD vaccination required"));
    }

    private Long requestVisit(String authHeader, Long livestockId) throws Exception {
        MvcResult result =
                mockMvc
                        .perform(
                                post("/api/vet-visits")
                                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(requestBody(livestockId)))
                        .andExpect(status().isCreated())
                        .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    void farmer_canRequestVetVisit() throws Exception {
        mockMvc
                .perform(
                        post("/api/vet-visits")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody(livestockAId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.livestockId").value(livestockAId))
                .andExpect(jsonPath("$.vetId").doesNotExist());
    }

    @Test
    void unauthenticated_cannotRequestVetVisit() throws Exception {
        mockMvc
                .perform(
                        post("/api/vet-visits")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody(livestockAId)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void farmer_cannotRequestVetVisitForAnotherFarmersLivestock() throws Exception {
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));
        AuthenticatedUser farmerBPrincipal = new AuthenticatedUser(farmerB.id(), farmerB.email(), Role.FARMER);
        FarmResponse farmB = farmService.createFarm(new FarmCreateRequest("Farm B", "Location B", farmerB.id()));
        LivestockResponse cowB =
                livestockService.createLivestock(
                        new LivestockCreateRequest("COW-B1", Species.COW, LocalDate.of(2022, 1, 1), farmB.id()),
                        farmerBPrincipal);

        mockMvc
                .perform(
                        post("/api/vet-visits")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody(cowB.id())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    void vet_canSeePendingRequests() throws Exception {
        requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(get("/api/vet-visits/pending").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("REQUESTED"));
    }

    @Test
    void farmer_cannotAccessPendingEndpoint() throws Exception {
        mockMvc
                .perform(get("/api/vet-visits/pending").header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader))
                .andExpect(status().isForbidden());
    }

    @Test
    void vet_canAcceptRequest() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void acceptedVisit_getsAuthenticatedVetAssigned() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vetId").isNotEmpty())
                .andExpect(jsonPath("$.vetName").value("Dr Vet"));
    }

    @Test
    void farmer_cannotAcceptRequest() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/accept")
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader))
                .andExpect(status().isForbidden());
    }

    @Test
    void vet_canRejectRequest() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(post("/api/vet-visits/" + visitId + "/reject").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.vetId").doesNotExist());
    }

    @Test
    void acceptedVisit_canBeCompleted() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/complete")
                                .header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
    }

    @Test
    void requestedVisit_cannotBeCompletedDirectly() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/complete")
                                .header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void completedVisit_cannotBeAcceptedAgain() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/complete").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void rejectedVisit_cannotBeCompleted() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/reject").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/complete")
                                .header(HttpHeaders.AUTHORIZATION, vetAuthHeader))
                .andExpect(status().isConflict());
    }

    @Test
    void otherVet_cannotCompleteAnotherVetsAcceptedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        UserResponse otherVet =
                userService.createUser(
                        new UserCreateRequest("Dr Other Vet", uniqueEmail("other-vet"), "pass1234", Role.VET));
        String otherVetAuthHeader = authHeaderFor(otherVet);

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/complete")
                                .header(HttpHeaders.AUTHORIZATION, otherVetAuthHeader))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    void admin_canCompleteAnotherVetsAcceptedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin"), "pass1234", Role.ADMIN));

        mockMvc
                .perform(
                        post("/api/vet-visits/" + visitId + "/complete")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    private String updateBody(String reason) throws Exception {
        return objectMapper.writeValueAsString(
                new VetVisitUpdateRequest(LocalDate.of(2026, 9, 1), reason, "Updated notes"));
    }

    @Test
    void farmer_canEditOwnRequestedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Updated reason")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reason").value("Updated reason"))
                .andExpect(jsonPath("$.preferredDate").value("2026-09-01"));
    }

    @Test
    void farmer_cannotEditAcceptedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Trying to change after acceptance")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void farmer_cannotEditCompletedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/accept").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/complete").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Trying to change after completion")))
                .andExpect(status().isConflict());
    }

    @Test
    void farmer_cannotEditRejectedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        mockMvc.perform(post("/api/vet-visits/" + visitId + "/reject").header(HttpHeaders.AUTHORIZATION, vetAuthHeader));

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, farmerAAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Trying to change after rejection")))
                .andExpect(status().isConflict());
    }

    @Test
    void farmer_cannotEditAnotherFarmersVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b-edit"), "pass1234", Role.FARMER));

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerB))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Hijacked reason")))
                .andExpect(status().isForbidden());
    }

    @Test
    void vet_cannotEditFarmersRequestedVisit() throws Exception {
        Long visitId = requestVisit(farmerAAuthHeader, livestockAId);

        mockMvc
                .perform(
                        put("/api/vet-visits/" + visitId)
                                .header(HttpHeaders.AUTHORIZATION, vetAuthHeader)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateBody("Vet trying to edit farmer request")))
                .andExpect(status().isForbidden());
    }
}
