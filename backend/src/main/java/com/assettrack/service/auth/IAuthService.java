package com.assettrack.service.auth;

import com.assettrack.dto.auth.AuthResponse;
import com.assettrack.dto.auth.LoginRequest;
import com.assettrack.dto.auth.SignupRequest;

public interface IAuthService {
    AuthResponse register(SignupRequest request);

    AuthResponse login(LoginRequest request);
}