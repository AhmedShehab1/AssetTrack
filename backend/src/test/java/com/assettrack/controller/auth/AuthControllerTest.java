package com.assettrack.controller.auth;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;
import com.assettrack.exception.EmailAlreadyExistsException;
import com.assettrack.service.auth.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({AuthControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class})
@DisplayName("AuthController")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  AuthService authService;

    @BeforeEach
    void resetMocks() {
        reset(authService);
    }
    
    @TestConfiguration
    static class SecurityTestConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(AbstractHttpConfigurer::disable)
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/auth/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    private SignupRequest signupRequest(String email, String password) {
        SignupRequest r = new SignupRequest();
        r.setEmail(email);
        r.setPassword(password);
        r.setFullName("Alice Johnson");
        return r;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/auth/register")
    class Register {

        @Test
        @DisplayName("returns 201 and token on success")
        void success() throws Exception {
            SignupRequest req = signupRequest("alice@example.com", "Password1!");
            com.assettrack.dto.user.UserResponse response = com.assettrack.dto.user.UserResponse.builder().email("alice@example.com").role("DEVELOPER").build();
            when(authService.register(any())).thenReturn(response);

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("alice@example.com"))
                    .andExpect(jsonPath("$.role").value("DEVELOPER"));
        }

        @Test
        @DisplayName("returns 409 when email already exists")
        void emailTaken() throws Exception {
            SignupRequest req = signupRequest("taken@example.com", "Password1!");
            when(authService.register(any()))
                    .thenThrow(new EmailAlreadyExistsException("Email already in use"));

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("returns 422 when email is blank")
        void blankEmail() throws Exception {
            SignupRequest req = signupRequest("", "Password1!");

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("returns 422 when password is blank")
        void blankPassword() throws Exception {
            SignupRequest req = signupRequest("alice@example.com", "");

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("returns 422 when email format is invalid")
        void invalidEmailFormat() throws Exception {
            SignupRequest req = signupRequest("not-an-email", "Password1!");

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).register(any());
        }

        @Test
        @DisplayName("returns 422 when body is missing")
        void missingBody() throws Exception {
            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("returns 200 and token on success")
        void success() throws Exception {
            LoginRequest req = loginRequest("alice@example.com", "Password1!");
            AuthResponse response = new AuthResponse("jwt-token", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().email("alice@example.com").role("DEVELOPER").build());
            when(authService.login(any())).thenReturn(response);

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                    .andExpect(jsonPath("$.user.role").value("DEVELOPER"));
        }

        @Test
        @DisplayName("returns 401 on bad credentials")
        void badCredentials() throws Exception {
            LoginRequest req = loginRequest("alice@example.com", "WrongPass1!");
            when(authService.login(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("returns 422 when email is blank")
        void blankEmail() throws Exception {
            LoginRequest req = loginRequest("", "Password1!");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("returns 422 when password is blank")
        void blankPassword() throws Exception {
            LoginRequest req = loginRequest("alice@example.com", "");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(authService, never()).login(any());
        }

        @Test
        @DisplayName("returns 422 when body is missing")
        void missingBody() throws Exception {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }
}