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
import com.assettrack.dto.user.UserResponse;
import com.assettrack.mapper.user.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements IAuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthMapper authMapper;
    private final UserMapper userMapper;

    /**
     * Generates a JWT token for the given user.
     * @param user the user to generate the token for
     * @return a JWT token
     */
    private String generateToken(User user) {
        return jwtService.generateToken(
                Map.of(
                        "role", "ROLE_" + user.getRole().name(),
                        "userId", user.getId()),
                Duration.ofHours(24));
    }

    /**
     * Registers a new user.
     * @param request contains the user's email, password, and full name
     * @return the newly created user
     * @throws EmailAlreadyExistsException if the user's email is already in use
     * */
    @Transactional
    @Override
    public UserResponse register(SignupRequest request) {
        log.info("Registering user: {}", request);
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already in use");
            throw new EmailAlreadyExistsException("Email already in use");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        
        String fullName = request.getFullName();
        if (fullName != null) {
            String[] parts = fullName.split(" ", 2);
            user.setFirstName(parts[0]);
            if (parts.length > 1) {
                user.setLastName(parts[1]);
            }
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DEVELOPER);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    /**
     * Authenticates a user and generates a JWT token.
     * Throws an exception if authentication fails.
     * @param request contains the user's email and password
     * @return a JWT token and user details
     * @throws ResourceNotFoundException if the user does not exist
     * @throws EmailAlreadyExistsException if the user's email is already in use
     * */
    @Transactional(readOnly = true)
    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Logging in user: {}", request);
        authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!user.isActive()) {
            log.warn("User is not active");
            throw new ResourceNotFoundException("User is not active");
        }
        String token = generateToken(user);
        return authMapper.toResponse(token, user);
    }
}