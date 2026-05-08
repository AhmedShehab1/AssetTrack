package com.assettrack.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import com.assettrack.dto.user.UserSummary;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private UserSummary user;
}