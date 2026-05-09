package com.assettrack.security.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CORS configuration properties loaded from application.yml.
 * 
 * Allows externalization of allowed origins for flexibility across environments
 * (development, staging, production).
 * 
 * Example in application.yml:
 * 
 * <pre>
 * cors:
 *   allowed-origins: http://localhost:3000,http://localhost:5173,https://app.example.com
 * </pre>
 */
@Data
@Component
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    /**
     * Comma-separated list of allowed origins for CORS requests.
     * Defaults to localhost development ports if not specified.
     */
    private String allowedOrigins = "http://localhost:3000,http://localhost:5173,http://localhost:8080";
}
