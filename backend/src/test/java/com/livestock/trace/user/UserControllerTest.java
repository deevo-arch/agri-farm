package com.livestock.trace.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.security.JwtService;
import com.livestock.trace.user.dto.UserAdminUpdateRequest;
import com.livestock.trace.user.dto.UserCreateRequest;
import com.livestock.trace.user.dto.UserResponse;
import com.livestock.trace.user.dto.UserUpdateRequest;
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
class UserControllerTest {

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
    void user_canUpdateOwnProfile() throws Exception {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Old Name", uniqueEmail("profile"), "pass1234", Role.FARMER));
        String newEmail = uniqueEmail("profile-new");

        mockMvc
                .perform(
                        patch("/api/users/me")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmer))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new UserUpdateRequest("New Name", newEmail))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("New Name"))
                .andExpect(jsonPath("$.email").value(newEmail))
                .andExpect(jsonPath("$.role").value("FARMER"));
    }

    @Test
    void updateProfile_rejectsEmailAlreadyUsedByAnotherUser() throws Exception {
        UserResponse existing =
                userService.createUser(
                        new UserCreateRequest("Existing", uniqueEmail("taken"), "pass1234", Role.FARMER));
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Farmer", uniqueEmail("editor"), "pass1234", Role.FARMER));

        mockMvc
                .perform(
                        patch("/api/users/me")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmer))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new UserUpdateRequest("Farmer", existing.email()))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void updateProfile_cannotChangeRole() throws Exception {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Farmer", uniqueEmail("role-check"), "pass1234", Role.FARMER));

        // UserUpdateRequest has no role field at all, so there's nothing to smuggle a role change
        // through even with a raw payload — the deserializer just ignores the unknown property.
        String body =
                "{\"fullName\":\"Farmer\",\"email\":\""
                        + farmer.email()
                        + "\",\"role\":\"ADMIN\"}";

        mockMvc
                .perform(
                        patch("/api/users/me")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmer))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("FARMER"));
    }

    @Test
    void admin_canListAllUsers() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin"), "pass1234", Role.ADMIN));
        userService.createUser(
                new UserCreateRequest("Some Farmer", uniqueEmail("list-farmer"), "pass1234", Role.FARMER));

        mockMvc
                .perform(get("/api/users").header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$..password").doesNotExist());
    }

    @Test
    void farmer_cannotListAllUsers() throws Exception {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Farmer", uniqueEmail("no-list"), "pass1234", Role.FARMER));

        mockMvc
                .perform(get("/api/users").header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmer)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticated_cannotListUsers() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void admin_canCreateFarmerVetAndAdmin() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin-creator"), "pass1234", Role.ADMIN));
        String authHeader = authHeaderFor(admin);

        for (Role role : Role.values()) {
            UserCreateRequest request =
                    new UserCreateRequest(role + " Created", uniqueEmail("created-" + role), "pass1234", role);
            mockMvc
                    .perform(
                            post("/api/users")
                                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.role").value(role.name()));
        }
    }

    @Test
    void nonAdmin_cannotCreateUsers() throws Exception {
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Farmer", uniqueEmail("cant-create"), "pass1234", Role.FARMER));

        mockMvc
                .perform(
                        post("/api/users")
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmer))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new UserCreateRequest(
                                                        "Sneaky Vet", uniqueEmail("sneaky"), "pass1234", Role.VET))))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canUpdateAnotherUsersNameEmailAndRole() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Admin User", uniqueEmail("admin-editor"), "pass1234", Role.ADMIN));
        UserResponse farmer =
                userService.createUser(
                        new UserCreateRequest("Plain Farmer", uniqueEmail("promote-me"), "pass1234", Role.FARMER));
        String newEmail = uniqueEmail("promoted");

        mockMvc
                .perform(
                        put("/api/users/" + farmer.id())
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new UserAdminUpdateRequest("Promoted Farmer", newEmail, Role.VET))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Promoted Farmer"))
                .andExpect(jsonPath("$.email").value(newEmail))
                .andExpect(jsonPath("$.role").value("VET"));
    }

    @Test
    void nonAdmin_cannotChangeAnotherUsersRole() throws Exception {
        UserResponse farmerA =
                userService.createUser(
                        new UserCreateRequest("Farmer A", uniqueEmail("farmer-a-edit"), "pass1234", Role.FARMER));
        UserResponse farmerB =
                userService.createUser(
                        new UserCreateRequest("Farmer B", uniqueEmail("farmer-b-edit"), "pass1234", Role.FARMER));

        mockMvc
                .perform(
                        put("/api/users/" + farmerB.id())
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(farmerA))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new UserAdminUpdateRequest(
                                                        "Farmer B", farmerB.email(), Role.ADMIN))))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_cannotDemoteSelfAwayFromAdmin() throws Exception {
        UserResponse admin =
                userService.createUser(
                        new UserCreateRequest("Sole Admin", uniqueEmail("sole-admin"), "pass1234", Role.ADMIN));

        mockMvc
                .perform(
                        put("/api/users/" + admin.id())
                                .header(HttpHeaders.AUTHORIZATION, authHeaderFor(admin))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                new UserAdminUpdateRequest("Sole Admin", admin.email(), Role.FARMER))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("BUSINESS_RULE_VIOLATION"));
    }
}
