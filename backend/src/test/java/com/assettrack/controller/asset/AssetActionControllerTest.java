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
import com.assettrack.mapper.asset.AssetMapper; // FIX 4: added import
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
import org.springframework.data.web.config.EnableSpringDataWebSupport; // FIX 2: added import
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

        private static final java.util.UUID ASSET_ID_1 = java.util.UUID
                        .fromString("11111111-1111-1111-1111-111111111111");
        private static final java.util.UUID ASSET_ID_5 = java.util.UUID
                        .fromString("55555555-5555-5555-5555-555555555555");
        private static final java.util.UUID REPORT_ID_10 = java.util.UUID
                        .fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        private static final java.util.UUID ASSET_ID_999 = java.util.UUID
                        .fromString("99999999-9999-9999-9999-999999999999");

        @Autowired
        MockMvc mockMvc;
        @Autowired
        ObjectMapper objectMapper;
        @MockBean
        IAssetService assetService;
        @MockBean
        IDashboardService dashboardService;
        @MockBean
        AssetMapper assetMapper; // FIX 4: was missing, caused NPE → 500

        // FIX 4: removed @MockBean AssetRepository — that's a repository layer,
        // wrong to mock here; the controller never touches it directly.

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
                                        .sessionManagement(
                                                        s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                        .exceptionHandling(ex -> ex
                                                        .authenticationEntryPoint((req, res, e) -> res.sendError(401))
                                                        .accessDeniedHandler((req, res, e) -> res.sendError(403)) // FIX
                                                                                                                  // 3a:
                                                                                                                  // was
                                                                                                                  // missing
                                                                                                                  // →
                                                                                                                  // forbidden
                                                                                                                  // fell
                                                                                                                  // through
                                                                                                                  // to
                                                                                                                  // 500
                                        )
                                        .authorizeHttpRequests(auth -> auth
                                                        .requestMatchers("/assets/condition-reports").authenticated()
                                                        // FIX 3b: pattern was
                                                        // "/api/assets/*/condition-reports/*/resolve"
                                                        // but the actual URL has no {assetId} segment → changed to
                                                        // match real route
                                                        .requestMatchers("/assets/condition-reports/*/resolve")
                                                        .hasAnyRole("ADMIN", "MANAGER")
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

        private ConditionReportResponse buildReportResponse(java.util.UUID id, java.util.UUID assetId) {
                return ConditionReportResponse.builder()
                                .id(id)
                                .assetId(assetId)
                                .asset(AssetSummaryResponse.builder().type(AssetType.LAPTOP).brand("Dell")
                                                .model("XPS 15").serialNumber("SN-001").build())
                                .reportedBy(com.assettrack.dto.user.UserSummary.builder()
                                                .id(java.util.UUID.randomUUID()).email("alice@example.com")
                                                .role(com.assettrack.domain.user.Role.DEVELOPER).build())
                                .description("Screen is cracked")
                                .severity(ConditionSeverity.MEDIUM)
                                .reportedAt(LocalDateTime.now())
                                .status(ConditionReportStatus.OPEN)
                                .build();
        }

        // ── GET /api/assets/search ────────────────────────────────────────────────

        @Nested
        @DisplayName("GET /api/assets/search")
        @WithMockUser
        class SearchAssets {

                @WithMockUser

                @Test
                @DisplayName("returns 200 with results and no filters")
                void noFilters() throws Exception {
                        Page<AssetResponse> page = new PageImpl<>(
                                        List.of(buildAssetResponse(ASSET_ID_1)), PageRequest.of(0, 10), 1);

                        // Use any() for ALL args to guarantee the stub always matches
                        when(assetService.searchAssets(any(), any(), any(), any(), any()))
                                        .thenReturn(page);

                        mockMvc.perform(get("/search/assets"))
                                        .andDo(print())
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.content[0].id").value(ASSET_ID_1.toString()))
                                        .andExpect(jsonPath("$.page.totalElements").value(1));
                }

                @Test
                @DisplayName("returns 200 filtered by status and type")
                void withFilters() throws Exception {
                        Page<AssetResponse> page = new PageImpl<>(
                                        List.of(buildAssetResponse(ASSET_ID_1)), PageRequest.of(0, 10), 1);

                        // Only be specific about the args you actually control via request params
                        when(assetService.searchAssets(
                                        eq(AssetStatus.AVAILABLE), eq(AssetType.LAPTOP), any(), any(), any()))
                                        .thenReturn(page);

                        mockMvc.perform(get("/search/assets")
                                        .param("status", "AVAILABLE")
                                        .param("type", "LAPTOP"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.page.totalElements").value(1));
                }

                @Test
                @WithMockUser
                @DisplayName("returns 200 with empty page when no match")
                void noResults() throws Exception {
                        List<AssetResponse> empty = List.of();
                        Page<AssetResponse> page = new PageImpl<>(empty, PageRequest.of(0, 10), 0);

                        when(assetService.searchAssets(any(), any(), any(), any(), any()))
                                        .thenReturn(page);

                        mockMvc.perform(get("/search/assets"))
                                        .andDo(print())
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.page.totalElements").value(0));
                }
        }

        // ── GET /api/assets/quick-spare ───────────────────────────────────────────

        @Nested
        @WithMockUser
        @DisplayName("GET /api/assets/quick-spare")
        class QuickSpare {

                @Test
                @WithMockUser
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
                @WithMockUser
                @DisplayName("returns 404 when no spare available")
                void notFound() throws Exception {
                        when(dashboardService.getQuickSpareLaptop())
                                        .thenThrow(new ResourceNotFoundException("No available spare laptop found."));

                        mockMvc.perform(get("/search/assets/spare-laptop"))
                                        .andExpect(status().isNotFound());
                }
        }

        // ── POST /api/assets/condition-reports ────────────────────────────────────

        @Nested
        @DisplayName("POST /api/assets/condition-reports")
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
                @DisplayName("returns 422 when assetId is null")
                void missingAssetId() throws Exception {
                        CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                                        .description("Screen is cracked")
                                        .severity(ConditionSeverity.MEDIUM)
                                        .build();

                        mockMvc.perform(post("/assets/condition-reports")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(req)))
                                        .andExpect(status().isUnprocessableEntity());

                        verify(assetService, never()).createConditionReport(any(), any());
                }

                @Test
                @WithMockUser
                @DisplayName("returns 422 when issueDescription is blank")
                void missingDescription() throws Exception {
                        CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                                        .assetId(ASSET_ID_1)
                                        .description("")
                                        .severity(ConditionSeverity.MEDIUM)
                                        .build();

                        mockMvc.perform(post("/assets/condition-reports")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(req)))
                                        .andExpect(status().isUnprocessableEntity());

                        verify(assetService, never()).createConditionReport(any(), any());
                }

                @Test
                @DisplayName("returns 401 when not authenticated")
                void unauthenticated() throws Exception {
                        CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                                        .assetId(ASSET_ID_1)
                                        .description("Screen is cracked")
                                        .severity(ConditionSeverity.MEDIUM)
                                        .build();

                        mockMvc.perform(post("/assets/condition-reports")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(req)))
                                        .andExpect(status().isUnauthorized());
                }
        }

        // ── GET /api/assets/{assetId}/condition-reports ───────────────────────────

        @Nested
        @DisplayName("GET /api/assets/{assetId}/condition-reports")
        class GetReportsByAsset {

                @Test
                @WithMockUser
                @DisplayName("returns 200 with reports list")
                void success() throws Exception {
                        when(assetService.getReportsByAsset(eq(ASSET_ID_1), any()))
                                        .thenReturn(List.of(buildReportResponse(REPORT_ID_10, ASSET_ID_1)));

                        mockMvc.perform(get("/assets/" + ASSET_ID_1 + "/condition-reports"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$[0].id").value(REPORT_ID_10.toString()))
                                        .andExpect(jsonPath("$[0].asset.serialNumber").value("SN-001"));
                }

                @Test
                @WithMockUser
                @DisplayName("returns 200 with empty list when no reports")
                void empty() throws Exception {
                        when(assetService.getReportsByAsset(eq(ASSET_ID_1), any())).thenReturn(List.of());

                        mockMvc.perform(get("/assets/" + ASSET_ID_1 + "/condition-reports"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$").isEmpty());
                }

                @Test
                @WithMockUser
                @DisplayName("returns 404 when asset not found")
                void assetNotFound() throws Exception {
                        when(assetService.getReportsByAsset(eq(ASSET_ID_999), any()))
                                        .thenThrow(new ResourceNotFoundException("Asset not found with id: 999"));

                        mockMvc.perform(get("/assets/" + ASSET_ID_999 + "/condition-reports"))
                                        .andExpect(status().isNotFound());
                }
        }

        // ── GET /api/assets/condition-reports/{reportId} ──────────────────────────

        @Nested
        @DisplayName("GET /api/assets/condition-reports/{reportId}")
        class GetConditionReport {

                @Test
                @WithMockUser
                @DisplayName("returns 200 with report")
                void success() throws Exception {
                        when(assetService.getReportById(eq(REPORT_ID_10), any()))
                                        .thenReturn(buildReportResponse(REPORT_ID_10, ASSET_ID_1));

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
                                        .thenThrow(new ResourceNotFoundException(
                                                        "Condition report not found with id: 999"));

                        mockMvc.perform(get("/assets/condition-reports/" + ASSET_ID_999))
                                        .andExpect(status().isNotFound());
                }
        }

        // ── PATCH /api/assets/condition-reports/{reportId}/resolve ────────────────

        @Nested
        @DisplayName("PATCH /api/assets/condition-reports/{reportId}/resolve")
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
                @WithMockUser(roles = "MANAGER")
                @DisplayName("returns 200 with resolved report for manager")
                void successAsManager() throws Exception {
                        ConditionReportResponse response = buildReportResponse(REPORT_ID_10, ASSET_ID_1);
                        when(assetService.resolveReport(REPORT_ID_10)).thenReturn(response);

                        mockMvc.perform(patch("/assets/condition-reports/" + REPORT_ID_10 + "/resolve"))
                                        .andExpect(status().isOk());
                }

                @Test
                @WithMockUser(roles = "DEVELOPER")
                @DisplayName("returns 403 for developer")
                void forbidden() throws Exception {
                        // FIX 3: no stub needed — security must reject before reaching service
                        mockMvc.perform(patch("/assets/condition-reports/" + REPORT_ID_10 + "/resolve"))
                                        .andExpect(status().isForbidden());
                }

                @Test
                @DisplayName("returns 401 when not authenticated")
                void unauthenticated() throws Exception {
                        // FIX 3: no stub needed — security must reject before reaching service
                        mockMvc.perform(patch("/assets/condition-reports/" + REPORT_ID_10 + "/resolve"))
                                        .andExpect(status().isUnauthorized());
                }

                @Test
                @WithMockUser(roles = "ADMIN")
                @DisplayName("returns 404 when report not found")
                void notFound() throws Exception {
                        when(assetService.resolveReport(ASSET_ID_999))
                                        .thenThrow(new ResourceNotFoundException(
                                                        "Condition report not found with id: 999"));

                        mockMvc.perform(patch("/api/assets/condition-reports/" + ASSET_ID_999 + "/resolve"))
                                        .andExpect(status().isNotFound());
                }
        }
}