package com.assettrack.controller.auth;

import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;
import com.assettrack.service.auth.IAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication Controller for AssetTrack.
 *
 * Handles public authentication operations including user registration and
 * login.
 * Provides JWT tokens for authenticated requests.
 *
 * Base URL: {@code /api/v1/auth}
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {
    private final IAuthService authService;

    /**
     * Registers a new user account.
     * 
     * Creates a new user with the provided email, password, and full name.
     * Email must be unique in the system.
     * 
     * @param request the signup request containing email, password, and full name
     * @return ResponseEntity with the created user profile (HTTP 201)
     * @throws ConflictException   if email already exists
     * @throws BadRequestException if validation fails
     */
    @PostMapping("/signup")
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    @ApiResponse(responseCode = "201", description = "User registered successfully", content = @Content(schema = @Schema(implementation = com.assettrack.dto.user.UserResponse.class)))
    @ApiResponse(responseCode = "422", description = "Validation error")
    @ApiResponse(responseCode = "409", description = "Email already exists")
    /**
     * Registers a new user account.
     *
     * @param request signup payload containing email, password, and full name
     * @return the created user profile
     */
    public ResponseEntity<com.assettrack.dto.user.UserResponse> register(
            @RequestBody @Validated SignupRequest request) {
        com.assettrack.dto.user.UserResponse response = authService.register(request);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Authenticates a user and returns a JWT token.
     * 
     * Validates the provided credentials and issues a JWT token on successful
     * authentication.
     * 
     * @param request the login request containing email and password
     * @return ResponseEntity with authentication response including JWT token (HTTP
     *         200)
     * @throws UnauthorizedException if credentials are invalid
     */
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user and returns a JWT token")
    @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(schema = @Schema(implementation = AuthResponse.class)))
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login payload containing email and password
     * @return authentication response with the access token
     */
    public ResponseEntity<AuthResponse> login(@RequestBody @Validated LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
