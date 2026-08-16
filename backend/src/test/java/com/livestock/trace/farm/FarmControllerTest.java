package com.livestock.trace.farm;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.farm.dto.FarmCreateRequest;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.user.Role;
import com.livestock.trace.user.UserService;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
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
class FarmControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserService userService;
    @Autowired private JwtService jwtService;

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@test.local";
    }

    private String authHeaderFor(UserResponse user) {
        return "Bearer " + jwtService.generateToken(userService.getById(user.id()));
    }

    @Test
    void getMyFarms_returnsOnlyFarmsOwnedByCurrentUser() throws Exception {
        UserResponse farmerA =
                userService.createUser(
                        new UserCreateRequest("Farmer A", uniqueEmail("farmer-a"), "pass1234", Role.FARMER));
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));

        mockMvc.perform(
                post("/api/farms")
                        .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(
                                        new FarmCreateRequest("Farm A", "Location A", farmerA.id()))));
        mockMvc.perform(
                post("/api/farms")
                        .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(
                                        new FarmCreateRequest("Farm B", "Location B", farmerB.id()))));

        mockMvc
                .perform(get("/api/farms/mine").header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Farm A"));
    }

    @Test
    void createFarm_ignoresClientSuppliedOwnerId_usesAuthenticatedCaller() throws Exception {
        UserResponse farmerA =
                userService.createUser(
                        new UserCreateRequest("Farmer A", uniqueEmail("farmer-a"), "pass1234", Role.FARMER));
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b"), "pass1234", Role.FARMER));

        // Farmer A submits a farm but claims Farmer B as the owner.
        mockMvc
                .perform(
                        post("/api/farms")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerA))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new FarmCreateRequest("Spoofed Farm", "Nowhere", farmerB.id()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ownerId").value(farmerA.id()))
                .andExpect(jsonPath("$.ownerName").value("Farmer A"));

        mockMvc
                .perform(get("/api/farms/mine").header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getMyFarms_returnsEmptyListWhenNoFarmsOwned() throws Exception {
        UserResponse farmerWithNoFarm =
                userService.createUser(
                        new UserCreateRequest(
                                "No Farm Farmer", uniqueEmail("no-farm"), "pass1234", Role.FARMER));

        mockMvc
                .perform(
                        get("/api/farms/mine")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerWithNoFarm)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
