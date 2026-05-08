package com.assettrack.controller.dashboard;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.service.dashboard.IDashboardService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({ DashboardControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class })
@DisplayName("DashboardController")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IDashboardService dashboardService;

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

    private DashboardSummaryDto summary() {
        return new DashboardSummaryDto(
                3L,
                List.of(
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.AVAILABLE, 2L),
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.ALLOCATED, 1L),
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.UNDER_REPAIR, 0L),
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.DECOMMISSIONED, 0L),
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.SPARE, 0L),
                        new DashboardSummaryDto.StatusCountDto(AssetStatus.EXPIRED, 0L)),
                List.of(
                        new DashboardSummaryDto.TypeCountDto(AssetType.LAPTOP, 2L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.MONITOR, 1L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.KEYBOARD, 0L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.MOUSE, 0L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.HEADSET, 0L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.DOCKING_STATION, 0L),
                        new DashboardSummaryDto.TypeCountDto(AssetType.OTHER, 0L)),
                0L,
                0L,
                0L,
                0L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void success() throws Exception {
        when(dashboardService.getSummary()).thenReturn(summary());

        mockMvc.perform(get("/dashboard/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets").value(3))
                .andExpect(jsonPath("$.byStatus[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.byType[0].type").value("LAPTOP"));
    }

    @Test
    @WithMockUser(roles = "DEVELOPER")
    void forbidden() throws Exception {
        mockMvc.perform(get("/dashboard/inventory"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticated() throws Exception {
        mockMvc.perform(get("/dashboard/inventory"))
                .andExpect(status().isUnauthorized());
    }
}