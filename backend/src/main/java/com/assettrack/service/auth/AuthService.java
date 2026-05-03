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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
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
    private final AuthMapper authMapper;

    private String generateToken(User user) {
        return jwtService.generateToken(
                Map.of(
                        "role",   "ROLE_" + user.getRole().name(),
                        "userId", user.getId()
                ),
                Duration.ofHours(24)
        );
    }
    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already in use");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DEVELOPER);
        userRepository.save(user);
        String token = generateToken(user);
        return authMapper.toResponse(token, user);
    }
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(),request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = generateToken(user);
        return authMapper.toResponse(token, user);
    }
}