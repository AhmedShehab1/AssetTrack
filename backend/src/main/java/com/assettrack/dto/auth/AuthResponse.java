package com.assettrack.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import com.assettrack.dto.user.UserResponse;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserResponse user;
}