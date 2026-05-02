package com.assettrack.security.service;

import org.springframework.security.oauth2.jwt.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.issuer:assettrack-api}")
    private String issuer;

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    public JwtService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }


    public String generateToken(Map<String, Object> claims, Duration ttl) {
        Instant now = Instant.now();
        Instant exp = now.plus(ttl);

        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(exp);

        Object email = claims.get("email");
        if (email instanceof String s && !s.isBlank()) {
            builder.subject(s);
        }

        claims.forEach(builder::claim);

        JwtClaimsSet claimSet = builder.build();
        return jwtEncoder.encode(JwtEncoderParameters.from(claimSet)).getTokenValue();
    }



    public Jwt validateToken(String token) {
        return jwtDecoder.decode(token);
    }

    public String extractEmail(String token) {
        return validateToken(token).getClaimAsString("email");
    }

    public String extractRole(String token) {
        return validateToken(token).getClaimAsString("role");
    }

    public Long extractUserId(String token) {
        String userIdStr = validateToken(token).getClaimAsString("userId");
        if (userIdStr == null) {
            return null;
        }
        return Long.parseLong(userIdStr);
    }

    public String extractSubject(String token) {
        return validateToken(token).getSubject();
    }

}
