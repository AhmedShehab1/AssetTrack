package com.assettrack.security;

import java.util.UUID;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.service.asset.AssetService;
import com.assettrack.service.auth.AuthService;
import com.assettrack.service.dashboard.DashboardService;
import com.assettrack.service.notification.NotificationService;
import com.assettrack.service.user.UserService;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
        "spring.main.allow-bean-definition-overriding=true"
})
@AutoConfigureMockMvc
public class SecurityFilterChainTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserService userService;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private AssetService assetService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private com.assettrack.service.notification.AlertService alertService;

    @MockBean
    private com.assettrack.service.notification.EmailNotificationService emailNotificationService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    AssetService assetService;

    /**
     * Provides in-memory RSA keys for the test context, overriding the production
     * beans in {@code RsaKeyProperties} that require PEM files on disk.
     * As a nested static {@code @TestConfiguration}, Spring Boot automatically applies
     * it after the main application configuration, ensuring these beans take precedence.
     */
    @TestConfiguration
    static class TestRsaKeyConfig {

        private static final KeyPair KEY_PAIR;

        static {
            try {
                KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
                generator.initialize(2048);
                KEY_PAIR = generator.generateKeyPair();
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate test RSA key pair", e);
            }
        }

        @Bean
        public RSAPublicKey publicKey() {
            return (RSAPublicKey) KEY_PAIR.getPublic();
        }

        @Bean
        public RSAPrivateKey privateKey() {
            return (RSAPrivateKey) KEY_PAIR.getPrivate();
        }

        @Bean
        public JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
            JWK jwk = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
            return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
        }

        @Bean
        public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
            return NimbusJwtDecoder.withPublicKey(publicKey).build();
        }
    }

    @Test
    public void publicEndpoint_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/auth/test").contextPath("/api/v1"))
                .andExpect(status().isOk());
    }

    @Test
    public void protectedEndpoint_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/assets/test").contextPath("/api/v1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void adminEndpoint_WithDeveloperRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users/test").contextPath("/api/v1")
                .with(jwt().jwt(jwt -> jwt.claim("role", "DEVELOPER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    public void adminEndpoint_WithAdminRole_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users/test").contextPath("/api/v1")
                .with(jwt().jwt(jwt -> jwt.claim("role", "ADMIN"))
                        .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    public void usersEndpoint_WithManagerRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users").contextPath("/api/v1")
                .with(jwt().jwt(jwt -> jwt.claim("role", "MANAGER"))
                        .authorities(new SimpleGrantedAuthority("ROLE_MANAGER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    public void usersEndpoint_WithAdminRole_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users").contextPath("/api/v1")
                .with(jwt().jwt(jwt -> jwt.claim("role", "ADMIN"))
                        .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    public void selfProfileEndpoint_WithAuthenticatedUser_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me").contextPath("/api/v1")
                .with(jwt().jwt(jwt -> jwt.claim("role", "DEVELOPER").claim("userId", UUID.fromString("00000000-0000-0000-0000-000000000001")))
                        .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk());
    }

    @Test
    public void selfProfileEndpoint_WithoutJwt_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me").contextPath("/api/v1"))
                .andExpect(status().isUnauthorized());
    }
}
