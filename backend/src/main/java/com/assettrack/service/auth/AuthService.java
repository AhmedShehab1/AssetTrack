package com.assettrack.service.auth;

import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;
import com.assettrack.exception.InvalidCredentialsException;
import com.assettrack.exception.UserAlreadyExistsException;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already in use");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DEVELOPER);
        User savedUser = userRepository.save(user);
        String token = generateTokenForUser(savedUser);
        String userIdStr = String.valueOf(savedUser.getId());
        return new AuthResponse(token, savedUser.getRole().name(), userIdStr, savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        String token = generateTokenForUser(user);
        String userIdStr = String.valueOf(user.getId());
        return new AuthResponse(token, user.getRole().name(), userIdStr, user.getEmail());
    }

    private String generateTokenForUser(User user) {
        return jwtService.generateToken(Map.of(
                        "email", user.getEmail(),
                        "role", "ROLE_" + user.getRole().name(),
                        "userId", String.valueOf(user.getId())
                ),
                Duration.ofHours(24)
        );
    }
}