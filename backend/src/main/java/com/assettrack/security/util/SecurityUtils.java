package com.assettrack.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Security utility class for extracting user context from JWT tokens
 * Provides centralized methods for user identification and role checking
 */
@Component
public class SecurityUtils {

    /**
     * Extract current user ID from JWT authentication.
     * Handles both Long and String representations of userId in the JWT claim.
     */
    public Long getCurrentUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            Object userIdClaim = jwt.getClaim("userId");
            if (userIdClaim instanceof Number number) {
                return number.longValue();
            }
            if (userIdClaim instanceof String userIdStr) {
                try {
                    return Long.parseLong(userIdStr);
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid user ID in token: " + userIdStr);
                }
            }
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }

    /**
     * Check if current user has admin role
     */
    public boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority));
    }

    /**
     * Check if the current user has any of the supplied roles.
     * Accepts role names with or without the ROLE_ prefix.
     */
    public boolean hasAnyRole(Authentication authentication, String... roles) {
        if (authentication == null || roles == null || roles.length == 0) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> Arrays.stream(roles)
                        .map(this::normalizeRole)
                        .anyMatch(authority::equals));
    }

    /**
     * Managers and admins can operate across all condition reports.
     */
    public boolean isManagerOrAdmin(Authentication authentication) {
        return hasAnyRole(authentication, "MANAGER", "ADMIN");
    }

    /**
     * Get user email from JWT token
     */
    public String getCurrentUserEmail(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            return jwt.getClaimAsString("email");
        }
        return null;
    }

    /**
     * Extract user role from JWT token
     */
    public String getCurrentUserRole(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            return jwt.getClaimAsString("role");
        }
        return null;
    }

    private String normalizeRole(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
