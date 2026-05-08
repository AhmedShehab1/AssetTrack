package com.assettrack.service.auth;

import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;
import com.assettrack.exception.EmailAlreadyExistsException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.auth.AuthMapper;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.service.JwtService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock AuthMapper authMapper;

    @InjectMocks AuthService authService;

    private User buildUser(java.util.UUID id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setPasswordHash("hashed");
        u.setRole(Role.DEVELOPER);
        u.setActive(true);
        return u;
    }

    private SignupRequest signupRequest(String email, String password) {
        SignupRequest r = new SignupRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    // ── register() ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("saves user with encoded password and DEVELOPER role")
        void success() {
            SignupRequest req = signupRequest("alice@example.com", "Password1");
            AuthResponse expected = new AuthResponse("jwt-token", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build());

            when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
            when(passwordEncoder.encode(req.getPassword())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(java.util.UUID.randomUUID());
                return u;
            });
            when(jwtService.generateToken(anyMap(), any())).thenReturn("jwt-token");
            when(authMapper.toResponse(anyString(), any(User.class))).thenReturn(expected);

            AuthResponse result = authService.register(req);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getEmail()).isEqualTo("alice@example.com");
            assertThat(captor.getValue().getPasswordHash()).isEqualTo("hashed");
            assertThat(captor.getValue().getRole()).isEqualTo(Role.DEVELOPER);
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("throws EmailAlreadyExistsException when email is taken")
        void emailTaken() {
            SignupRequest req = signupRequest("taken@example.com", "Password1");
            when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(req))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining("already in use");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("never stores raw password")
        void passwordIsEncoded() {
            SignupRequest req = signupRequest("bob@example.com", "Password1");

            when(userRepository.existsByEmail(any())).thenReturn(false);
            when(passwordEncoder.encode("Password1")).thenReturn("bcrypt-hash");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(java.util.UUID.randomUUID());
                return u;
            });
            when(jwtService.generateToken(anyMap(), any())).thenReturn("tok");
            when(authMapper.toResponse(any(), any())).thenReturn(new AuthResponse("tok", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build()));

            authService.register(req);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getPasswordHash())
                    .isNotEqualTo("Password1")
                    .isEqualTo("bcrypt-hash");
        }

        @Test
        @DisplayName("sets active=true on new user")
        void newUserIsActive() {
            SignupRequest req = signupRequest("charlie@example.com", "Password1");

            when(userRepository.existsByEmail(any())).thenReturn(false);
            when(passwordEncoder.encode(any())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(java.util.UUID.randomUUID());
                return u;
            });
            when(jwtService.generateToken(anyMap(), any())).thenReturn("tok");
            when(authMapper.toResponse(any(), any())).thenReturn(new AuthResponse("tok", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build()));

            authService.register(req);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().isActive()).isTrue();
        }

        @Test
        @DisplayName("returns token from jwtService")
        void returnsToken() {
            SignupRequest req = signupRequest("dave@example.com", "Password1");
            AuthResponse expected = new AuthResponse("my-special-token", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build());

            when(userRepository.existsByEmail(any())).thenReturn(false);
            when(passwordEncoder.encode(any())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(java.util.UUID.randomUUID());
                return u;
            });
            when(jwtService.generateToken(anyMap(), any())).thenReturn("my-special-token");
            when(authMapper.toResponse(eq("my-special-token"), any())).thenReturn(expected);

            AuthResponse result = authService.register(req);

            assertThat(result.getAccessToken()).isEqualTo("my-special-token");
        }
    }

    // ── login() ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("authenticates and returns token for valid credentials")
        void success() {
            LoginRequest req = loginRequest("alice@example.com", "Password1");
            User user = buildUser(java.util.UUID.randomUUID(), "alice@example.com");
            AuthResponse expected = new AuthResponse("jwt-token", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build());

            when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
            when(jwtService.generateToken(anyMap(), any())).thenReturn("jwt-token");
            when(authMapper.toResponse(anyString(), any(User.class))).thenReturn(expected);

            AuthResponse result = authService.login(req);

            verify(authenticationManager).authenticate(
                    new UsernamePasswordAuthenticationToken("alice@example.com", "Password1"));
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("propagates BadCredentialsException on wrong password")
        void wrongPassword() {
            LoginRequest req = loginRequest("alice@example.com", "WrongPass1");
            doThrow(new BadCredentialsException("Bad credentials"))
                    .when(authenticationManager).authenticate(any());

            assertThatThrownBy(() -> authService.login(req))
                    .isInstanceOf(BadCredentialsException.class);

            verify(userRepository, never()).findByEmail(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found after auth")
        void userNotFound() {
            LoginRequest req = loginRequest("ghost@example.com", "Password1");

            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(req))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("calls authenticationManager with correct email and password")
        void passesCorrectCredentialsToAuthManager() {
            LoginRequest req = loginRequest("bob@example.com", "MyPass1");
            User user = buildUser(java.util.UUID.randomUUID(), "bob@example.com");

            when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(user));
            when(jwtService.generateToken(anyMap(), any())).thenReturn("tok");
            when(authMapper.toResponse(any(), any())).thenReturn(new AuthResponse("tok", "Bearer", 3600L, com.assettrack.dto.user.UserResponse.builder().role("DEVELOPER").build()));

            authService.login(req);

            verify(authenticationManager).authenticate(
                    new UsernamePasswordAuthenticationToken("bob@example.com", "MyPass1"));
        }

        @Test
        @DisplayName("propagates DisabledException when account is inactive")
        void disabledAccount() {
            LoginRequest req = loginRequest("inactive@example.com", "Password1");
            doThrow(new DisabledException("Account disabled"))
                    .when(authenticationManager).authenticate(any());

            assertThatThrownBy(() -> authService.login(req))
                    .isInstanceOf(DisabledException.class);

            verify(userRepository, never()).findByEmail(any());
        }
    }
}