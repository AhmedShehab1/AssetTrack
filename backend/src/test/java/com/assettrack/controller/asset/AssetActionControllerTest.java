package com.assettrack.controller.asset;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.dto.asset.AssetSummaryResponse;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.service.asset.IAssetService;
import com.assettrack.service.dashboard.IDashboardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({ AssetActionController.class, ConditionController.class })
@Import({ AssetActionControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class })
@DisplayName("AssetActionController")
class AssetActionControllerTest {

    private static final java.util.UUID ASSET_ID_1 = java.util.UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final java.util.UUID ASSET_ID_5 = java.util.UUID.fromString("55555555-5555-5555-5555-555555555555");
    private static final java.util.UUID REPORT_ID_10 = java.util.UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final java.util.UUID ASSET_ID_999 = java.util.UUID.fromString("99999999-9999-9999-9999-999999999999");

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @MockBean
    IAssetService assetService;
    @MockBean
    IDashboardService dashboardService;
    @MockBean
    AssetMapper assetMapper;

    @BeforeEach
    void resetMocks() {
        reset(assetService, dashboardService);
    }

    @TestConfiguration
    @EnableMethodSecurity
    @EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
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
                            .accessDeniedHandler((req, res, e) -> res.sendError(403))
                    )
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/assets/condition-reports").authenticated()
                            .requestMatchers("/assets/condition-reports/*/resolve").hasAnyRole("ADMIN", "MANAGER")
                            .anyRequest().permitAll())
                    .build();
        }
    }

    private AssetResponse buildAssetResponse(java.util.UUID id) {
        return AssetResponse.builder()
                .id(id)
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("XPS 15")
                .serialNumber("SN-001")
                .status(AssetStatus.AVAILABLE)
                .build();
    }

    private AssetSummaryResponse buildAssetSummary(java.util.UUID id) {
        return AssetSummaryResponse.builder()
                .id(id)
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("XPS 15")
                .serialNumber("SN-001")
                .build();
    }

    private ConditionReportResponse buildReportResponse(java.util.UUID id, java.util.UUID assetId) {
        return ConditionReportResponse.builder()
                .id(id)
                .assetId(assetId)
                .asset(buildAssetSummary(assetId))
                .reportedBy(com.assettrack.dto.user.UserSummary.builder()
                        .email("alice@example.com")
                        .fullName("Alice Smith").build())
                .description("Screen is cracked")
                .severity(ConditionSeverity.MEDIUM)
                .reportedAt(LocalDateTime.now())
                .status(ConditionReportStatus.OPEN)
                .build();
    }

    // ── GET /search/assets ────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /search/assets")
    @WithMockUser
    class SearchAssets {

        @Test
        @DisplayName("returns 200 with results and no filters")
        void noFilters() throws Exception {
            Page<AssetResponse> page = new PageImpl<>(List.of(buildAssetResponse(ASSET_ID_1)), PageRequest.of(0, 10), 1);
            when(assetService.searchAssets(any(), any(), any(), any(), any())).thenReturn(page);

            mockMvc.perform(get("/search/assets"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(ASSET_ID_1.toString()))
                    .andExpect(jsonPath("$.meta.totalElements").value(1));
        }

        @Test
        @DisplayName("returns 200 filtered by status and type")
        void withFilters() throws Exception {
            Page<AssetResponse> page = new PageImpl<>(List.of(buildAssetResponse(ASSET_ID_1)), PageRequest.of(0, 10), 1);
            when(assetService.searchAssets(eq(AssetStatus.AVAILABLE), eq(AssetType.LAPTOP), any(), any(), any())).thenReturn(page);

            mockMvc.perform(get("/search/assets")
                            .param("status", "AVAILABLE")
                            .param("type", "LAPTOP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.meta.totalElements").value(1));
        }
    }

    // ── GET /search/assets/spare-laptop ───────────────────────────────────────────

    @Nested
    @WithMockUser
    @DisplayName("GET /search/assets/spare-laptop")
    class QuickSpare {

        @Test
        @DisplayName("returns 200 with spare laptop")
        void success() throws Exception {
            SpareAssetResponse dto = SpareAssetResponse.builder()
                    .asset(buildAssetResponse(ASSET_ID_5))
                    .build();
            when(dashboardService.getQuickSpareLaptop()).thenReturn(dto);

            mockMvc.perform(get("/search/assets/spare-laptop"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.asset.id").value(ASSET_ID_5.toString()))
                    .andExpect(jsonPath("$.asset.type").value("LAPTOP"));
        }

        @Test
        @DisplayName("returns 404 when no spare available")
        void notFound() throws Exception {
            when(dashboardService.getQuickSpareLaptop()).thenThrow(new ResourceNotFoundException("No available spare laptop found."));

            mockMvc.perform(get("/search/assets/spare-laptop"))
                    .andExpect(status().isNotFound());
        }
    }

    // ── POST /assets/condition-reports ────────────────────────────────────

    @Nested
    @DisplayName("POST /assets/condition-reports")
    class CreateConditionReport {

        @Test
        @WithMockUser
        @DisplayName("returns 201 on success")
        void success() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .assetId(ASSET_ID_1)
                    .description("Screen is cracked")
                    .severity(ConditionSeverity.MEDIUM)
                    .build();
            ConditionReportResponse response = buildReportResponse(REPORT_ID_10, ASSET_ID_1);
            when(assetService.createConditionReport(any(), any())).thenReturn(response);

            mockMvc.perform(post("/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(REPORT_ID_10.toString()))
                    .andExpect(jsonPath("$.asset.serialNumber").value("SN-001"))
                    .andExpect(jsonPath("$.status").value("OPEN"));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when asset not found")
        void assetNotFound() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .assetId(ASSET_ID_999)
                    .description("Screen is cracked")
                    .severity(ConditionSeverity.MEDIUM)
                    .build();
            when(assetService.createConditionReport(any(), any()))
                    .thenThrow(new ResourceNotFoundException("Asset not found with id: 999"));

            mockMvc.perform(post("/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser
        @DisplayName("returns 400 when assetId is null")
        void missingAssetId() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .description("Screen is cracked")
                    .severity(ConditionSeverity.MEDIUM)
                    .build();

            mockMvc.perform(post("/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isBadRequest());

            verify(assetService, never()).createConditionReport(any(), any());
        }
    }

    // ── GET /assets/{assetId}/condition-reports ───────────────────────────

    @Nested
    @DisplayName("GET /assets/{assetId}/condition-reports")
    class GetReportsByAsset {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with reports list")
        void success() throws Exception {
            Page<ConditionReportResponse> page = new PageImpl<>(List.of(buildReportResponse(REPORT_ID_10, ASSET_ID_1)), PageRequest.of(0, 10), 1);
            when(assetService.getReportsByAsset(eq(ASSET_ID_1), any(), any())).thenReturn(page);

            mockMvc.perform(get("/assets/" + ASSET_ID_1 + "/condition-reports"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(REPORT_ID_10.toString()))
                    .andExpect(jsonPath("$.content[0].asset.id").value(ASSET_ID_1.toString()));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when asset not found")
        void assetNotFound() throws Exception {
            when(assetService.getReportsByAsset(eq(ASSET_ID_999), any(), any()))
                    .thenThrow(new ResourceNotFoundException("Asset not found with id: 999"));

            mockMvc.perform(get("/assets/" + ASSET_ID_999 + "/condition-reports"))
                    .andExpect(status().isNotFound());
        }
    }

    // ── GET /assets/condition-reports/{reportId} ──────────────────────────

    @Nested
    @DisplayName("GET /assets/condition-reports/{reportId}")
    class GetConditionReport {

        @Test
        @WithMockUser
        @DisplayName("returns 200 with report")
        void success() throws Exception {
            when(assetService.getReportById(eq(REPORT_ID_10), any())).thenReturn(buildReportResponse(REPORT_ID_10, ASSET_ID_1));

            mockMvc.perform(get("/assets/condition-reports/" + REPORT_ID_10))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(REPORT_ID_10.toString()))
                    .andExpect(jsonPath("$.description").value("Screen is cracked"));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when report not found")
        void notFound() throws Exception {
            when(assetService.getReportById(eq(ASSET_ID_999), any()))
                    .thenThrow(new ResourceNotFoundException("Condition report not found with id: 999"));

            mockMvc.perform(get("/assets/condition-reports/" + ASSET_ID_999))
                    .andExpect(status().isNotFound());
        }
    }

    // ── PATCH /assets/condition-reports/{reportId}/resolve ────────────────

    @Nested
    @DisplayName("PATCH /assets/condition-reports/{reportId}/resolve")
    class ResolveReport {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 200 with resolved report for admin")
        void successAsAdmin() throws Exception {
            ConditionReportResponse response = buildReportResponse(REPORT_ID_10, ASSET_ID_1);
            response.setStatus(ConditionReportStatus.RESOLVED);
            when(assetService.resolveReport(REPORT_ID_10)).thenReturn(response);

            mockMvc.perform(patch("/assets/condition-reports/" + REPORT_ID_10 + "/resolve"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(REPORT_ID_10.toString()));
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for developer")
        void forbidden() throws Exception {
            mockMvc.perform(patch("/assets/condition-reports/" + REPORT_ID_10 + "/resolve"))
                    .andExpect(status().isForbidden());
        }
    }
}