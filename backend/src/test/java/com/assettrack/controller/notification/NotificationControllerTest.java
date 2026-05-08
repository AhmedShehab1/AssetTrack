package com.assettrack.controller.notification;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.domain.notification.NotificationType;
import com.assettrack.dto.notification.NotificationResponse;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.service.notification.INotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@Import({ NotificationControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class })
@DisplayName("NotificationController")
class NotificationControllerTest {

    private static final UUID NOTIFICATION_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID ASSET_ID = UUID.fromString("55555555-5555-5555-5555-555555555555");

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private INotificationService notificationService;

    @TestConfiguration
    @EnableMethodSecurity
    static class SecurityTestConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(AbstractHttpConfigurer::disable)
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint((req, res, e) -> res.sendError(401))
                            .accessDeniedHandler((req, res, e) -> res.sendError(403)))
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .build();
        }
    }

    private NotificationResponse notification() {
        return new NotificationResponse(
                NOTIFICATION_ID,
                NotificationType.CONDITION_REPORT_OPENED,
                "Your report was received",
                false,
                ASSET_ID,
                LocalDateTime.of(2026, 5, 8, 12, 0));
    }

    @Test
    @WithMockUser
    void listNotifications_success() throws Exception {
        when(notificationService.getCurrentUserNotifications(any(Authentication.class)))
                .thenReturn(List.of(notification()));

        mockMvc.perform(get("/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(NOTIFICATION_ID.toString()))
                .andExpect(jsonPath("$[0].type").value("CONDITION_REPORT_OPENED"))
                .andExpect(jsonPath("$[0].message").value("Your report was received"));
    }

    @Test
    @WithMockUser
    void markAsRead_success() throws Exception {
        NotificationResponse read = notification();
        read.setRead(true);
        when(notificationService.markAsRead(eq(NOTIFICATION_ID), any(Authentication.class))).thenReturn(read);

        mockMvc.perform(patch("/notifications/" + NOTIFICATION_ID + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(NOTIFICATION_ID.toString()))
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @WithMockUser
    void markAsRead_notFound() throws Exception {
        when(notificationService.markAsRead(eq(NOTIFICATION_ID), any(Authentication.class)))
                .thenThrow(new ResourceNotFoundException("Notification not found"));

        mockMvc.perform(patch("/notifications/" + NOTIFICATION_ID + "/read"))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticated() throws Exception {
        mockMvc.perform(get("/notifications"))
                .andExpect(status().isUnauthorized());
    }
}