package com.assettrack.controller;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.repository.notification.NotificationRepository;
import com.assettrack.repository.user.UserRepository;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:condition-notification-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.main.allow-bean-definition-overriding=true"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConditionAndNotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetAllocationRepository assetAllocationRepository;

    @Autowired
    private ConditionReportRepository conditionReportRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @MockBean
    private JavaMailSender javaMailSender;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        conditionReportRepository.deleteAll();
        assetAllocationRepository.deleteAll();
        assetRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void reportAssetCondition_WhenRegularUserDoesNotOwnAsset_ReturnsForbidden() throws Exception {
        User currentUser = userRepository.save(user("developer@assettrack.com"));
        User owner = userRepository.save(user("owner@assettrack.com"));
        Asset unownedAsset = assetRepository.save(asset("SN-UNOWNED-001"));
        assetAllocationRepository.save(AssetAllocation.builder()
                .asset(unownedAsset)
                .user(owner)
                .checkoutDate(LocalDateTime.now())
                .build());

        mockMvc.perform(post("/api/v1/assets/{id}/condition", unownedAsset.getId())
                        .contextPath("/api/v1")
                        .with(jwt().jwt(token -> token
                                        .claim("userId", currentUser.getId())
                                        .claim("role", "ROLE_DEVELOPER"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"issueDescription\":\"Screen flickers intermittently\", \"severity\":\"MEDIUM\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getNotifications_ReturnsOnlyAlertsForLoggedInUser() throws Exception {
        User currentUser = userRepository.save(user("developer@assettrack.com"));
        User otherUser = userRepository.save(user("other@assettrack.com"));

        notificationRepository.save(Notification.builder()
                .recipient(currentUser.getEmail())
                .messageBody("Your condition report was received")
                .type("CONDITION_REPORT")
                .createdAt(LocalDateTime.now())
                .build());
        notificationRepository.save(Notification.builder()
                .recipient(otherUser.getEmail())
                .messageBody("Another user's alert")
                .type("CONDITION_REPORT")
                .createdAt(LocalDateTime.now())
                .build());

        mockMvc.perform(get("/api/v1/notifications")
                        .contextPath("/api/v1")
                        .with(jwt().jwt(token -> token
                                        .claim("userId", currentUser.getId())
                                        .claim("role", "ROLE_DEVELOPER"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].recipient").value(currentUser.getEmail()))
                .andExpect(jsonPath("$[0].messageBody").value("Your condition report was received"));
    }

    @Test
    void markNotificationAsRead_WhenNotificationBelongsToCurrentUser_ReturnsUpdatedNotification() throws Exception {
        User currentUser = userRepository.save(user("developer@assettrack.com"));
        User otherUser = userRepository.save(user("other@assettrack.com"));

        Notification ownNotification = notificationRepository.save(Notification.builder()
                .recipient(currentUser.getEmail())
                .messageBody("Your condition report was received")
                .type("CONDITION_REPORT")
                .createdAt(LocalDateTime.now())
                .build());
        Notification otherNotification = notificationRepository.save(Notification.builder()
                .recipient(otherUser.getEmail())
                .messageBody("Another user's alert")
                .type("CONDITION_REPORT")
                .createdAt(LocalDateTime.now())
                .build());

        mockMvc.perform(patch("/api/v1/notifications/{notificationId}/read", ownNotification.getId())
                        .contextPath("/api/v1")
                        .with(jwt().jwt(token -> token
                                        .claim("userId", currentUser.getId())
                                        .claim("role", "ROLE_DEVELOPER"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ownNotification.getId().toString()))
                .andExpect(jsonPath("$.recipient").value(currentUser.getEmail()))
                .andExpect(jsonPath("$.read").value(true));

        Notification updatedOwnNotification = notificationRepository.findById(ownNotification.getId()).orElseThrow();
        Notification unchangedOtherNotification = notificationRepository.findById(otherNotification.getId()).orElseThrow();
        assertThat(updatedOwnNotification.isRead()).isTrue();
        assertThat(unchangedOtherNotification.isRead()).isFalse();
    }

    @Test
    void markNotificationAsRead_WhenNotificationBelongsToAnotherUser_ReturnsNotFound() throws Exception {
        User currentUser = userRepository.save(user("developer@assettrack.com"));
        User otherUser = userRepository.save(user("other@assettrack.com"));

        Notification otherNotification = notificationRepository.save(Notification.builder()
                .recipient(otherUser.getEmail())
                .messageBody("Another user's alert")
                .type("CONDITION_REPORT")
                .createdAt(LocalDateTime.now())
                .build());

        mockMvc.perform(patch("/api/v1/notifications/{notificationId}/read", otherNotification.getId())
                        .contextPath("/api/v1")
                        .with(jwt().jwt(token -> token
                                        .claim("userId", currentUser.getId())
                                        .claim("role", "ROLE_DEVELOPER"))
                                .authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isNotFound());

        Notification unchangedNotification = notificationRepository.findById(otherNotification.getId()).orElseThrow();
        assertThat(unchangedNotification.isRead()).isFalse();
    }

    private User user(String email) {
        return User.builder()
                .email(email)
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build();
    }

    private Asset asset(String serialNumber) {
        return Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude")
                .serialNumber(serialNumber)
                .status(AssetStatus.ALLOCATED)
                .build();
    }

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
}
