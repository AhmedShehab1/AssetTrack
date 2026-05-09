package com.assettrack.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import com.assettrack.dto.user.UserSummary;

/**
 * Authentication response returned after login.
 */
@Data
@AllArgsConstructor
public class AuthResponse {

    /** Signed JWT access token. */
    private String accessToken;
    /** Token type, typically Bearer. */
    private String tokenType;
    /** Token lifetime in seconds. */
    private long expiresIn;
    /** Authenticated user summary. */
    private UserSummary user;
}