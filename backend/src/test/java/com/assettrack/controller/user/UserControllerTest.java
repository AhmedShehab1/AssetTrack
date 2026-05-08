package com.assettrack.controller.user;

import com.assettrack.dto.user.UpdateEmailRequest;
import com.assettrack.dto.user.UpdatePasswordRequest;
import com.assettrack.dto.user.UserResponse;
import com.assettrack.exception.*;
import com.assettrack.service.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(UserControllerTest.SecurityTestConfig.class)
@DisplayName("UserController")
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  UserService userService;

    @BeforeEach
    void resetMocks() {
        reset(userService);
    }
    @TestConfiguration
    @EnableMethodSecurity
    static class SecurityTestConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(AbstractHttpConfigurer::disable)
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint((req, res, e) -> res.sendError(401))
                    )
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/api/auth/**").permitAll()
                            .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()
                            .requestMatchers("/api/users/**").hasRole("ADMIN")
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    private UserResponse buildResponse(java.util.UUID id, String email) {
        return new UserResponse(id, email, "DEVELOPER", true, LocalDateTime.now());
    }

    // ── GET /api/users/me ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/users/me")
    class GetMyProfile {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with profile for authenticated user")
        void success() throws Exception {
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");
            when(userService.getMyProfile(any())).thenReturn(response);

            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.email").value("alice@example.com"));
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── GET /api/users ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/users")
    class GetAllUsers {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with user page for admin")
        void success() throws Exception {
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");
            var page = new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1);
            when(userService.getAllUsers(any())).thenReturn(page);

            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].email").value("alice@example.com"))
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/api/users"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── GET /api/users/inactive ───────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/users/inactive")
    class GetInactiveUsers {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with inactive users for admin")
        void success() throws Exception {
            UserResponse response = new UserResponse(java.util.UUID.randomUUID(), "bob@example.com", "DEVELOPER", false, LocalDateTime.now());
            var page = new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1);
            when(userService.getInactiveUsers(any())).thenReturn(page);

            mockMvc.perform(get("/api/users/inactive"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].active").value(false));
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(get("/api/users/inactive"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/api/users/inactive"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── GET /api/users/{id} ───────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/users/{id}")
    class GetUserById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with user for admin")
        void success() throws Exception {
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "alice@example.com");
            when(userService.getUserById(java.util.UUID.randomUUID())).thenReturn(response);

            mockMvc.perform(get("/api/users/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.email").value("alice@example.com"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when user not found")
        void notFound() throws Exception {
            when(userService.getUserById(java.util.UUID.randomUUID()))
                    .thenThrow(new ResourceNotFoundException("User not found"));

            mockMvc.perform(get("/api/users/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(get("/api/users/1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/api/users/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── PUT /api/users/me/email ───────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/users/me/email")
    class UpdateEmail {

        private UpdateEmailRequest request(String newEmail, String password) {
            UpdateEmailRequest r = new UpdateEmailRequest();
            r.setNewEmail(newEmail);
            r.setPassword(password);
            return r;
        }

        @Test
        @WithMockUser
        @DisplayName("returns 200 with updated profile")
        void success() throws Exception {
            UpdateEmailRequest req = request("new@example.com", "Password1!");
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "new@example.com");
            when(userService.updateEmail(any(), any())).thenReturn(response);

            mockMvc.perform(put("/api/users/me/email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("new@example.com"));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 409 when email already taken")
        void emailTaken() throws Exception {
            UpdateEmailRequest req = request("taken@example.com", "Password1!");
            when(userService.updateEmail(any(), any()))
                    .thenThrow(new EmailAlreadyExistsException("Email already exists"));

            mockMvc.perform(put("/api/users/me/email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isConflict());
        }

        @Test
        @WithMockUser
        @DisplayName("returns 400 on wrong password")
        void wrongPassword() throws Exception {
            UpdateEmailRequest req = request("new@example.com", "WrongPass");
            when(userService.updateEmail(any(), any()))
                    .thenThrow(new InvalidPasswordException("Invalid password"));

            mockMvc.perform(put("/api/users/me/email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(put("/api/users/me/email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── PUT /api/users/me/password ────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/users/me/password")
    class UpdatePassword {

        private UpdatePasswordRequest request(String current, String newPass) {
            UpdatePasswordRequest r = new UpdatePasswordRequest();
            r.setCurrentPassword(current);
            r.setNewPassword(newPass);
            return r;
        }

        @Test
        @WithMockUser
        @DisplayName("returns 204 on success")
        void success() throws Exception {
            UpdatePasswordRequest req = request("Password1!", "NewPassword1!");
            doNothing().when(userService).updatePassword(any(), any());

            mockMvc.perform(put("/api/users/me/password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser
        @DisplayName("returns 400 on wrong current password")
        void wrongPassword() throws Exception {
            UpdatePasswordRequest req = request("WrongPass", "NewPassword1!");
            doThrow(new InvalidPasswordException("Invalid password"))
                    .when(userService).updatePassword(any(), any());

            mockMvc.perform(put("/api/users/me/password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(put("/api/users/me/password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── PUT /api/users/{id}/role ──────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/users/{id}/role")
    class UpdateUserRole {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with updated user")
        void success() throws Exception {
            UserResponse response = buildResponse(java.util.UUID.randomUUID(), "bob@example.com");
            when(userService.updateUserRole(eq(java.util.UUID.randomUUID()), eq("ADMIN"), any())).thenReturn(response);

            mockMvc.perform(put("/api/users/2/role")
                            .param("role", "ADMIN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(2));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 for invalid role")
        void invalidRole() throws Exception {
            when(userService.updateUserRole(eq(java.util.UUID.randomUUID()), eq("SUPERUSER"), any()))
                    .thenThrow(new InvalidRoleException("Invalid role"));

            mockMvc.perform(put("/api/users/2/role")
                            .param("role", "SUPERUSER"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when admin changes own role")
        void selfRole() throws Exception {
            when(userService.updateUserRole(eq(java.util.UUID.randomUUID()), any(), any()))
                    .thenThrow(new SelfOperationException("Cannot change own role"));

            mockMvc.perform(put("/api/users/1/role")
                            .param("role", "MANAGER"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(put("/api/users/2/role")
                            .param("role", "ADMIN"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(put("/api/users/2/role")
                            .param("role", "ADMIN"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── PUT /api/users/{id}/status ────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /api/users/{id}/status")
    class UpdateUserStatus {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 on deactivate")
        void deactivate() throws Exception {
            UserResponse response = new UserResponse(java.util.UUID.randomUUID(), "bob@example.com", "DEVELOPER", false, LocalDateTime.now());
            when(userService.updateUserStatus(eq(java.util.UUID.randomUUID()), eq(false), any())).thenReturn(response);

            mockMvc.perform(put("/api/users/2/status")
                            .param("active", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.active").value(false));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when admin changes own status")
        void selfStatus() throws Exception {
            when(userService.updateUserStatus(eq(java.util.UUID.randomUUID()), anyBoolean(), any()))
                    .thenThrow(new SelfOperationException("Cannot change own status"));

            mockMvc.perform(put("/api/users/1/status")
                            .param("active", "false"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(put("/api/users/2/status")
                            .param("active", "false"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(put("/api/users/2/status")
                            .param("active", "false"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── DELETE /api/users/me ──────────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/users/me")
    class DeleteSelf {

        @Test
        @WithMockUser
        @DisplayName("returns 204 on success")
        void success() throws Exception {
            doNothing().when(userService).deleteSelf(any());

            mockMvc.perform(delete("/api/users/me"))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(delete("/api/users/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── DELETE /api/users/{id} ────────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /api/users/{id}")
    class DeleteUser {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 204 on success")
        void success() throws Exception {
            doNothing().when(userService).deleteUser(eq(java.util.UUID.randomUUID()), any());

            mockMvc.perform(delete("/api/users/2"))
                    .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when user not found")
        void notFound() throws Exception {
            doThrow(new ResourceNotFoundException("User not found"))
                    .when(userService).deleteUser(eq(java.util.UUID.randomUUID()), any());

            mockMvc.perform(delete("/api/users/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when user is still active")
        void activeUser() throws Exception {
            doThrow(new ActiveUserDeletionException("Cannot delete active user"))
                    .when(userService).deleteUser(eq(java.util.UUID.randomUUID()), any());

            mockMvc.perform(delete("/api/users/2"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 400 when admin deletes own account")
        void selfDelete() throws Exception {
            doThrow(new SelfOperationException("Cannot delete own account"))
                    .when(userService).deleteUser(eq(java.util.UUID.randomUUID()), any());

            mockMvc.perform(delete("/api/users/1"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for non-admin")
        void forbidden() throws Exception {
            mockMvc.perform(delete("/api/users/2"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            mockMvc.perform(delete("/api/users/2"))
                    .andExpect(status().isUnauthorized());
        }
    }
}