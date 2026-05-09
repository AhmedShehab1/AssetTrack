package com.assettrack.service.auth;

import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;

import com.assettrack.dto.user.UserResponse;

/**
 * Contract for authentication operations.
 */
public interface IAuthService {
    UserResponse register(SignupRequest request);

    AuthResponse login(LoginRequest request);
}