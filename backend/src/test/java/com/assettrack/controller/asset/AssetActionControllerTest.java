package com.assettrack.controller.asset;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.asset.AssetMapper;                          // FIX 4: added import
import com.assettrack.service.asset.AssetService;
import com.assettrack.service.dashboard.DashboardService;
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
import org.springframework.data.web.config.EnableSpringDataWebSupport;  // FIX 2: added import
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AssetActionController.class)
@Import({AssetActionControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class})
@DisplayName("AssetActionController")
class AssetActionControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  AssetService assetService;
    @MockBean  DashboardService dashboardService;
    @MockBean  AssetMapper assetMapper;   // FIX 4: was missing, caused NPE → 500

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
                    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint((req, res, e) -> res.sendError(401))
                            .accessDeniedHandler((req, res, e) -> res.sendError(403)) // FIX 3a: was missing → forbidden fell through to 500
                    )
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/api/assets/condition-reports").authenticated()
                            // FIX 3b: pattern was "/api/assets/*/condition-reports/*/resolve"
                            // but the actual URL has no {assetId} segment → changed to match real route
                            .requestMatchers("/api/assets/condition-reports/*/resolve").hasAnyRole("ADMIN", "MANAGER")
                            .anyRequest().permitAll()
                    )
                    .build();
        }
    }

    private AssetResponse buildAssetResponse(Long id) {
        return AssetResponse.builder()
                .id(id)
                .type(AssetType.LAPTOP.name())
                .brand("Dell")
                .model("XPS 15")
                .serialNumber("SN-001")
                .status(AssetStatus.AVAILABLE.name())
                .build();
    }

    private ConditionReportResponse buildReportResponse(Long id, Long assetId) {
        return ConditionReportResponse.builder()
                .id(id)
                .assetId(assetId)
                .assetSerialNumber("SN-001")
                .reportedById(1L)
                .reportedByEmail("alice@example.com")
                .issueDescription("Screen is cracked")
                .reportDate(LocalDate.now())
                .status("OPEN")
                .build();
    }

    // ── GET /api/assets/search ────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/assets/search")
    class SearchAssets {

        @Test
        @DisplayName("returns 200 with results and no filters")
        void noFilters() throws Exception {
            Page<AssetResponse> page = new PageImpl<>(
                    List.of(buildAssetResponse(1L)), PageRequest.of(0, 10), 1);

            // Use any() for ALL args to guarantee the stub always matches
            when(assetService.searchAssets(any(), any(), any(), any(), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/assets/search"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.page.totalElements").value(1));
        }

        @Test
        @DisplayName("returns 200 filtered by status and type")
        void withFilters() throws Exception {
            Page<AssetResponse> page = new PageImpl<>(
                    List.of(buildAssetResponse(1L)), PageRequest.of(0, 10), 1);

            // Only be specific about the args you actually control via request params
            when(assetService.searchAssets(
                    eq(AssetStatus.AVAILABLE), eq(AssetType.LAPTOP), any(), any(), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/assets/search")
                            .param("status", "AVAILABLE")
                            .param("type", "LAPTOP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page.totalElements").value(1));
        }

        @Test
        @DisplayName("returns 200 with empty page when no match")
        void noResults() throws Exception {
            List<AssetResponse> empty = List.of();
            Page<AssetResponse> page = new PageImpl<>(empty, PageRequest.of(0, 10), 0);

            when(assetService.searchAssets(any(), any(), any(), any(), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/assets/search"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page.totalElements").value(0));
        }
    }

    // ── GET /api/assets/quick-spare ───────────────────────────────────────────

    @Nested
    @DisplayName("GET /api/assets/quick-spare")
    class QuickSpare {

        @Test
        @DisplayName("returns 200 with spare laptop")
        void success() throws Exception {
            QuickSpareAssetDto dto = new QuickSpareAssetDto(5L, "LAPTOP", "AVAILABLE");
            when(dashboardService.getQuickSpareLaptop()).thenReturn(dto);

            mockMvc.perform(get("/api/assets/quick-spare"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(5))
                    .andExpect(jsonPath("$.type").value("LAPTOP"));
        }

        @Test
        @DisplayName("returns 404 when no spare available")
        void notFound() throws Exception {
            when(dashboardService.getQuickSpareLaptop())
                    .thenThrow(new ResourceNotFoundException("No available spare laptop found."));

            mockMvc.perform(get("/api/assets/quick-spare"))
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
                    .assetId(1L)
                    .issueDescription("Screen is cracked")
                    .build();
            ConditionReportResponse response = buildReportResponse(10L, 1L);
            when(assetService.createConditionReport(any(), any())).thenReturn(response);

            mockMvc.perform(post("/api/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(10))
                    .andExpect(jsonPath("$.assetId").value(1))
                    .andExpect(jsonPath("$.status").value("OPEN"));
        }

        @Test
        @WithMockUser
        @DisplayName("returns 404 when asset not found")
        void assetNotFound() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .assetId(999L)
                    .issueDescription("Screen is cracked")
                    .build();
            when(assetService.createConditionReport(any(), any()))
                    .thenThrow(new ResourceNotFoundException("Asset not found with id: 999"));

            mockMvc.perform(post("/api/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser
        @DisplayName("returns 422 when assetId is null")
        void missingAssetId() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .issueDescription("Screen is cracked")
                    .build();

            mockMvc.perform(post("/api/assets/condition-reports")
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
                    .assetId(1L)
                    .issueDescription("")
                    .build();

            mockMvc.perform(post("/api/assets/condition-reports")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnprocessableEntity());

            verify(assetService, never()).createConditionReport(any(), any());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            CreateConditionReportRequest req = CreateConditionReportRequest.builder()
                    .assetId(1L)
                    .issueDescription("Screen is cracked")
                    .build();

            mockMvc.perform(post("/api/assets/condition-reports")
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
        @DisplayName("returns 200 with reports list")
        void success() throws Exception {
            when(assetService.getReportsByAsset(1L))
                    .thenReturn(List.of(buildReportResponse(10L, 1L)));

            mockMvc.perform(get("/api/assets/1/condition-reports"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(10))
                    .andExpect(jsonPath("$[0].assetId").value(1));
        }

        @Test
        @DisplayName("returns 200 with empty list when no reports")
        void empty() throws Exception {
            when(assetService.getReportsByAsset(1L)).thenReturn(List.of());

            mockMvc.perform(get("/api/assets/1/condition-reports"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isEmpty());
        }

        @Test
        @DisplayName("returns 404 when asset not found")
        void assetNotFound() throws Exception {
            when(assetService.getReportsByAsset(999L))
                    .thenThrow(new ResourceNotFoundException("Asset not found with id: 999"));

            mockMvc.perform(get("/api/assets/999/condition-reports"))
                    .andExpect(status().isNotFound());
        }
    }

    // ── GET /api/assets/condition-reports/{reportId} ──────────────────────────

    @Nested
    @DisplayName("GET /api/assets/condition-reports/{reportId}")
    class GetConditionReport {

        @Test
        @DisplayName("returns 200 with report")
        void success() throws Exception {
            when(assetService.getReportById(10L)).thenReturn(buildReportResponse(10L, 1L));

            mockMvc.perform(get("/api/assets/condition-reports/10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(10))
                    .andExpect(jsonPath("$.issueDescription").value("Screen is cracked"));
        }

        @Test
        @DisplayName("returns 404 when report not found")
        void notFound() throws Exception {
            when(assetService.getReportById(999L))
                    .thenThrow(new ResourceNotFoundException("Condition report not found with id: 999"));

            mockMvc.perform(get("/api/assets/condition-reports/999"))
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
            ConditionReportResponse response = buildReportResponse(10L, 1L);
            response.setStatus("RESOLVED");
            when(assetService.resolveReport(10L)).thenReturn(response);

            mockMvc.perform(patch("/api/assets/condition-reports/10/resolve"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(10));
        }

        @Test
        @WithMockUser(roles = "MANAGER")
        @DisplayName("returns 200 with resolved report for manager")
        void successAsManager() throws Exception {
            ConditionReportResponse response = buildReportResponse(10L, 1L);
            when(assetService.resolveReport(10L)).thenReturn(response);

            mockMvc.perform(patch("/api/assets/condition-reports/10/resolve"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "DEVELOPER")
        @DisplayName("returns 403 for developer")
        void forbidden() throws Exception {
            // FIX 3: no stub needed — security must reject before reaching service
            mockMvc.perform(patch("/api/assets/condition-reports/10/resolve"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 401 when not authenticated")
        void unauthenticated() throws Exception {
            // FIX 3: no stub needed — security must reject before reaching service
            mockMvc.perform(patch("/api/assets/condition-reports/10/resolve"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("returns 404 when report not found")
        void notFound() throws Exception {
            when(assetService.resolveReport(999L))
                    .thenThrow(new ResourceNotFoundException("Condition report not found with id: 999"));

            mockMvc.perform(patch("/api/assets/condition-reports/999/resolve"))
                    .andExpect(status().isNotFound());
        }
    }
}