package com.assettrack.controller.allocation;

import com.assettrack.common.exception.GlobalExceptionHandler;
import com.assettrack.domain.user.Role;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.service.allocation.IAllocationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AllocationController.class)
@Import({ AllocationControllerTest.SecurityTestConfig.class, GlobalExceptionHandler.class })
@DisplayName("AllocationController")
class AllocationControllerTest {

    private static final UUID ASSET_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID ALLOCATION_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID USER_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IAllocationService allocationService;

    @BeforeEach
    void resetMocks() {
        reset(allocationService);
    }

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
                    .authorizeHttpRequests(auth -> auth
                            .anyRequest().authenticated())
                    .build();
        }
    }

    private AllocationResponseDto buildResponse() {
        return AllocationResponseDto.builder()
                .id(ALLOCATION_ID)
                .assetId(ASSET_ID)
                .assignedTo(UserSummary.builder().id(USER_ID).email("alice@example.com").fullName("Alice Smith")
                        .role(Role.DEVELOPER).build())
                .allocatedAt(LocalDateTime.of(2026, 5, 8, 10, 0))
                .notes("Urgent allocation")
                .active(true)
                .build();
    }

    private AllocationHistoryDto buildHistory() {
        return AllocationHistoryDto.builder()
                .allocationId(ALLOCATION_ID)
                .assetId(ASSET_ID)
                .assetSerialNumber("SN-001")
                .assetBrand("Dell")
                .assetModel("Latitude")
                .assignedTo(UserSummary.builder().id(USER_ID).email("alice@example.com").fullName("Alice Smith")
                        .role(Role.DEVELOPER).build())
                .allocatedAt(LocalDateTime.of(2026, 5, 1, 8, 0))
                .deallocatedAt(LocalDateTime.of(2026, 5, 2, 8, 0))
                .durationDays(1)
                .build();
    }

    @Nested
    @DisplayName("GET /api/assets/{assetId}/allocations")
    class GetAllocations {

        @Test
        @WithMockUser(roles = "ADMIN")
        void success() throws Exception {
            when(allocationService.getAllocationHistory(ASSET_ID)).thenReturn(List.of(buildHistory()));

            mockMvc.perform(get("/api/assets/" + ASSET_ID + "/allocations"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].allocationId").value(ALLOCATION_ID.toString()))
                    .andExpect(jsonPath("$[0].assetId").value(ASSET_ID.toString()));
        }

        @Test
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/api/assets/" + ASSET_ID + "/allocations"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/assets/{assetId}/allocations")
    class Allocate {

        @Test
        @WithMockUser(roles = "MANAGER")
        void success() throws Exception {
            AllocationRequestDto request = AllocationRequestDto.builder()
                    .assignedToUserId(USER_ID)
                    .notes("Urgent allocation")
                    .build();
            when(allocationService.allocate(eq(ASSET_ID), any())).thenReturn(buildResponse());

            mockMvc.perform(post("/api/assets/" + ASSET_ID + "/allocations")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.assetId").value(ASSET_ID.toString()))
                    .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @WithMockUser(roles = "MANAGER")
        void notFound() throws Exception {
            AllocationRequestDto request = AllocationRequestDto.builder()
                    .assignedToUserId(USER_ID)
                    .build();
            when(allocationService.allocate(eq(ASSET_ID), any()))
                    .thenThrow(new ResourceNotFoundException("asset is not found"));

            mockMvc.perform(post("/api/assets/" + ASSET_ID + "/allocations")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/assets/{assetId}/allocations/{allocationId}")
    class GetAllocation {

        @Test
        @WithMockUser(roles = "ADMIN")
        void success() throws Exception {
            when(allocationService.getAllocationById(ALLOCATION_ID, ASSET_ID)).thenReturn(buildResponse());

            mockMvc.perform(get("/api/assets/" + ASSET_ID + "/allocations/" + ALLOCATION_ID))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(ALLOCATION_ID.toString()))
                    .andExpect(jsonPath("$.assetId").value(ASSET_ID.toString()));
        }
    }

    @Nested
    @DisplayName("POST /api/assets/{assetId}/allocations/deallocate")
    class Deallocate {

        @Test
        @WithMockUser(roles = "ADMIN")
        void success() throws Exception {
            doNothing().when(allocationService).deallocate(ASSET_ID);

            mockMvc.perform(post("/api/assets/" + ASSET_ID + "/allocations/deallocate"))
                    .andExpect(status().isNoContent());

            verify(allocationService).deallocate(ASSET_ID);
        }
    }
}