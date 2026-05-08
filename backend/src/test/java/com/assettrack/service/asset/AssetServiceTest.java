package com.assettrack.service.asset;

import com.assettrack.domain.asset.*;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AssetService")
class AssetServiceTest {

    @Mock AssetRepository assetRepository;
    @Mock ConditionReportRepository conditionReportRepository;
    @Mock UserRepository userRepository;
    @Mock AssetMapper assetMapper;
    @Mock SecurityUtils securityUtils;

    @InjectMocks AssetService assetService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private Asset buildAsset(Long id, AssetStatus status) {
        return Asset.builder()
                .id(id)
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("XPS 15")
                .serialNumber("SN-00" + id)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private User buildUser(Long id) {
        return User.builder()
                .id(id)
                .email("user" + id + "@example.com")
                .passwordHash("hash")
                .role(Role.DEVELOPER)
                .isActive(true)
                .build();
    }

    private AssetResponse buildAssetResponse(Long id) {
        return AssetResponse.builder()
                .id(id)
                .type(AssetType.LAPTOP.name())
                .brand("Dell")
                .model("XPS 15")
                .serialNumber("SN-00" + id)
                .status(AssetStatus.AVAILABLE.name())
                .build();
    }

    private ConditionReportResponse buildReportResponse(Long id, Long assetId) {
        return ConditionReportResponse.builder()
                .id(id)
                .assetId(assetId)
                .issueDescription("Screen cracked")
                .reportDate(LocalDate.now())
                .status("OPEN")
                .build();
    }

    // ── searchAssets ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("searchAssets")
    class SearchAssets {

        @Test
        @DisplayName("returns page of mapped results")
        void success() {
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);
            AssetResponse response = buildAssetResponse(1L);
            Page<Asset> assetPage = new PageImpl<>(List.of(asset));

            when(assetRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(assetPage);
            when(assetMapper.toResponse(asset)).thenReturn(response);

            Page<AssetResponse> result = assetService.searchAssets(
                    AssetStatus.AVAILABLE, AssetType.LAPTOP, "Dell", null,
                    PageRequest.of(0, 10));

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("returns empty page when no assets match")
        void empty() {
            when(assetRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(Page.empty());

            Page<AssetResponse> result = assetService.searchAssets(
                    null, null, null, null, PageRequest.of(0, 10));

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("passes null filters without error")
        void nullFilters() {
            when(assetRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(Page.empty());

            assertThatNoException().isThrownBy(() ->
                    assetService.searchAssets(null, null, null, null, PageRequest.of(0, 10)));
        }
    }

    // ── createConditionReport ─────────────────────────────────────────────────

    @Nested
    @DisplayName("createConditionReport")
    class CreateConditionReport {

        @Test
        @DisplayName("creates and returns report")
        void success() {
            Authentication auth = mock(Authentication.class);
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);
            User user = buildUser(1L);
            ConditionReport savedReport = ConditionReport.builder()
                    .id(10L)
                    .asset(asset)
                    .reportedBy(user)
                    .issueDescription("Screen cracked")
                    .reportDate(LocalDate.now())
                    .status(ReportStatus.OPEN)
                    .build();
            ConditionReportResponse response = buildReportResponse(10L, 1L);

            CreateConditionReportRequest request = CreateConditionReportRequest.builder()
                    .assetId(1L)
                    .issueDescription("Screen cracked")
                    .build();

            when(securityUtils.getCurrentUserId(auth)).thenReturn(1L);
            when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(conditionReportRepository.save(any())).thenReturn(savedReport);
            when(assetMapper.toResponse(savedReport)).thenReturn(response);

            ConditionReportResponse result = assetService.createConditionReport(request, auth);

            assertThat(result.getId()).isEqualTo(10L);
            assertThat(result.getStatus()).isEqualTo("OPEN");
            verify(conditionReportRepository).save(any(ConditionReport.class));
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when asset not found")
        void assetNotFound() {
            Authentication auth = mock(Authentication.class);
            when(securityUtils.getCurrentUserId(auth)).thenReturn(1L);
            when(assetRepository.findById(99L)).thenReturn(Optional.empty());

            CreateConditionReportRequest request = CreateConditionReportRequest.builder()
                    .assetId(99L)
                    .issueDescription("Screen cracked")
                    .build();

            assertThatThrownBy(() -> assetService.createConditionReport(request, auth))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when user not found")
        void userNotFound() {
            Authentication auth = mock(Authentication.class);
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);

            when(securityUtils.getCurrentUserId(auth)).thenReturn(99L);
            when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            CreateConditionReportRequest request = CreateConditionReportRequest.builder()
                    .assetId(1L)
                    .issueDescription("Screen cracked")
                    .build();

            assertThatThrownBy(() -> assetService.createConditionReport(request, auth))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ── getReportsByAsset ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("getReportsByAsset")
    class GetReportsByAsset {

        @Test
        @DisplayName("returns list of reports for existing asset")
        void success() {
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);
            User user = buildUser(1L);
            ConditionReport report = ConditionReport.builder()
                    .id(10L).asset(asset).reportedBy(user)
                    .issueDescription("Screen cracked")
                    .reportDate(LocalDate.now()).status(ReportStatus.OPEN).build();
            ConditionReportResponse response = buildReportResponse(10L, 1L);

            when(assetRepository.existsById(1L)).thenReturn(true);
            when(conditionReportRepository.findByAssetIdOrderByReportDateDesc(1L))
                    .thenReturn(List.of(report));
            when(assetMapper.toResponse(report)).thenReturn(response);

            List<ConditionReportResponse> result = assetService.getReportsByAsset(1L);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("returns empty list when asset has no reports")
        void empty() {
            when(assetRepository.existsById(1L)).thenReturn(true);
            when(conditionReportRepository.findByAssetIdOrderByReportDateDesc(1L))
                    .thenReturn(List.of());

            assertThat(assetService.getReportsByAsset(1L)).isEmpty();
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when asset not found")
        void assetNotFound() {
            when(assetRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> assetService.getReportsByAsset(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── getReportById ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getReportById")
    class GetReportById {

        @Test
        @DisplayName("returns report when found")
        void success() {
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);
            User user = buildUser(1L);
            ConditionReport report = ConditionReport.builder()
                    .id(10L).asset(asset).reportedBy(user)
                    .issueDescription("Screen cracked")
                    .reportDate(LocalDate.now()).status(ReportStatus.OPEN).build();
            ConditionReportResponse response = buildReportResponse(10L, 1L);

            when(conditionReportRepository.findById(10L)).thenReturn(Optional.of(report));
            when(assetMapper.toResponse(report)).thenReturn(response);

            ConditionReportResponse result = assetService.getReportById(10L);

            assertThat(result.getId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when report not found")
        void notFound() {
            when(conditionReportRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> assetService.getReportById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    // ── resolveReport ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("resolveReport")
    class ResolveReport {

        @Test
        @DisplayName("sets status to RESOLVED and returns updated report")
        void success() {
            Asset asset = buildAsset(1L, AssetStatus.AVAILABLE);
            User user = buildUser(1L);
            ConditionReport report = ConditionReport.builder()
                    .id(10L).asset(asset).reportedBy(user)
                    .issueDescription("Screen cracked")
                    .reportDate(LocalDate.now()).status(ReportStatus.OPEN).build();
            ConditionReportResponse response = ConditionReportResponse.builder()
                    .id(10L).assetId(1L).status("RESOLVED").build();

            when(conditionReportRepository.findById(10L)).thenReturn(Optional.of(report));
            when(conditionReportRepository.save(report)).thenReturn(report);
            when(assetMapper.toResponse(report)).thenReturn(response);

            ConditionReportResponse result = assetService.resolveReport(10L);

            assertThat(result.getStatus()).isEqualTo("RESOLVED");
            assertThat(report.getStatus()).isEqualTo(ReportStatus.RESOLVED);
            verify(conditionReportRepository).save(report);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when report not found")
        void notFound() {
            when(conditionReportRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> assetService.resolveReport(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }
}