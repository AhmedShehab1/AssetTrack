package com.assettrack.service.asset;

import com.assettrack.domain.asset.*;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.exception.SelfOperationException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private ConditionReportRepository conditionReportRepository;

    @Mock
    private AssetAllocationRepository assetAllocationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssetMapper assetMapper;

    @Mock
    private SecurityUtils securityUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AssetService assetService;

    @Test
    void createConditionReport_WhenRegularUserDoesNotOwnAsset_ThrowsForbidden() {
        Asset asset = testAsset();
        User reporter = testUser();

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(reporter.getId());
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(assetAllocationRepository.existsByAssetIdAndUserIdAndReturnDateIsNull(asset.getId(), reporter.getId()))
                .thenReturn(false);

        assertThatThrownBy(() -> assetService.createConditionReport(
                asset.getId(),
                "Battery no longer charges",
                authentication))
                .isInstanceOf(SelfOperationException.class)
                .hasMessageContaining("currently assigned");

        verify(conditionReportRepository, never()).save(any());
    }

    @Test
    void createConditionReport_WhenRegularUserOwnsAsset_PopulatesReporterFromJwt() {
        Asset asset = testAsset();
        User reporter = testUser();
        ConditionReportResponse mappedResponse = ConditionReportResponse.builder()
                .id(10L)
                .assetId(asset.getId())
                .reportedById(reporter.getId())
                .issueDescription("Battery no longer charges")
                .status("OPEN")
                .build();

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(reporter.getId());
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(assetAllocationRepository.existsByAssetIdAndUserIdAndReturnDateIsNull(asset.getId(), reporter.getId()))
                .thenReturn(true);
        when(conditionReportRepository.save(any(ConditionReport.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(assetMapper.toResponse(any(ConditionReport.class))).thenReturn(mappedResponse);

        ConditionReportResponse response = assetService.createConditionReport(
                asset.getId(),
                "Battery no longer charges",
                authentication);

        ArgumentCaptor<ConditionReport> reportCaptor = ArgumentCaptor.forClass(ConditionReport.class);
        verify(conditionReportRepository).save(reportCaptor.capture());

        ConditionReport savedReport = reportCaptor.getValue();
        assertThat(savedReport.getAsset()).isEqualTo(asset);
        assertThat(savedReport.getReportedBy()).isEqualTo(reporter);
        assertThat(savedReport.getIssueDescription()).isEqualTo("Battery no longer charges");
        assertThat(response).isEqualTo(mappedResponse);
    }

    @Test
    void getConditionReports_WhenManagerOrAdmin_ReturnsAllReports() {
        ConditionReport report = testReport(1L, testUser(7L));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(1L).build();

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(7L);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(true);
        when(conditionReportRepository.findAllByOrderByReportDateDesc()).thenReturn(List.of(report));
        when(assetMapper.toResponse(report)).thenReturn(mapped);

        List<ConditionReportResponse> result = assetService.getConditionReports(authentication);

        assertThat(result).containsExactly(mapped);
        verify(conditionReportRepository).findAllByOrderByReportDateDesc();
        verify(conditionReportRepository, never()).findByReportedByIdOrderByReportDateDesc(any());
    }

    @Test
    void getConditionReports_WhenRegularUser_ReturnsOnlyOwnReports() {
        ConditionReport ownReport = testReport(1L, testUser(7L));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(1L).build();

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(7L);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(conditionReportRepository.findByReportedByIdOrderByReportDateDesc(7L)).thenReturn(List.of(ownReport));
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        List<ConditionReportResponse> result = assetService.getConditionReports(authentication);

        assertThat(result).containsExactly(mapped);
        verify(conditionReportRepository).findByReportedByIdOrderByReportDateDesc(7L);
        verify(conditionReportRepository, never()).findAllByOrderByReportDateDesc();
    }

    @Test
    void getReportsByAsset_WhenManagerOrAdmin_ReturnsAllAssetReports() {
        Long assetId = 99L;
        ConditionReport report = testReport(1L, testUser(8L));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(1L).assetId(assetId).build();

        when(assetRepository.existsById(assetId)).thenReturn(true);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(7L);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(true);
        when(conditionReportRepository.findByAssetIdOrderByReportDateDesc(assetId)).thenReturn(List.of(report));
        when(assetMapper.toResponse(report)).thenReturn(mapped);

        List<ConditionReportResponse> result = assetService.getReportsByAsset(assetId, authentication);

        assertThat(result).containsExactly(mapped);
        verify(conditionReportRepository).findByAssetIdOrderByReportDateDesc(assetId);
        verify(conditionReportRepository, never())
                .findByAssetIdAndReportedByIdOrderByReportDateDesc(any(), any());
    }

    @Test
    void getReportsByAsset_WhenRegularUser_ReturnsOnlyOwnAssetReports() {
        Long assetId = 99L;
        Long userId = 7L;
        ConditionReport ownReport = testReport(1L, testUser(userId));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(1L).assetId(assetId).build();

        when(assetRepository.existsById(assetId)).thenReturn(true);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(conditionReportRepository.findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId))
                .thenReturn(List.of(ownReport));
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        List<ConditionReportResponse> result = assetService.getReportsByAsset(assetId, authentication);

        assertThat(result).containsExactly(mapped);
        verify(conditionReportRepository).findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId);
        verify(conditionReportRepository, never()).findByAssetIdOrderByReportDateDesc(any());
    }

    @Test
    void getReportById_WhenManagerOrAdmin_CanViewAnyReport() {
        Long reportId = 44L;
        ConditionReport report = testReport(reportId, testUser(99L));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(reportId).build();

        when(conditionReportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(true);
        when(assetMapper.toResponse(report)).thenReturn(mapped);

        ConditionReportResponse result = assetService.getReportById(reportId, authentication);

        assertThat(result).isEqualTo(mapped);
        verify(securityUtils, never()).getCurrentUserId(authentication);
    }

    @Test
    void getReportById_WhenRegularUserViewsOwnReport_ReturnsReport() {
        Long userId = 7L;
        Long reportId = 45L;
        ConditionReport ownReport = testReport(reportId, testUser(userId));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(reportId).reportedById(userId).build();

        when(conditionReportRepository.findById(reportId)).thenReturn(Optional.of(ownReport));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        ConditionReportResponse result = assetService.getReportById(reportId, authentication);

        assertThat(result).isEqualTo(mapped);
    }

    @Test
    void getReportById_WhenRegularUserViewsAnotherUsersReport_ThrowsForbidden() {
        Long userId = 7L;
        Long reportId = 46L;
        ConditionReport othersReport = testReport(reportId, testUser(8L));

        when(conditionReportRepository.findById(reportId)).thenReturn(Optional.of(othersReport));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);

        assertThatThrownBy(() -> assetService.getReportById(reportId, authentication))
                .isInstanceOf(SelfOperationException.class)
                .hasMessageContaining("view your own condition reports");

        verify(assetMapper, never()).toResponse(any(ConditionReport.class));
    }

    private Asset testAsset() {
        return Asset.builder()
                .id(99L)
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude")
                .serialNumber("SN-OWN-001")
                .status(AssetStatus.ALLOCATED)
                .build();
    }

    private ConditionReport testReport(Long reportId, User reporter) {
        return ConditionReport.builder()
                .id(reportId)
                .asset(testAsset())
                .reportedBy(reporter)
                .issueDescription("Battery no longer charges")
                .reportDate(LocalDate.now())
                .build();
    }

    private User testUser(Long id) {
        User user = testUser();
        user.setId(id);
        return user;
    }

    private User testUser() {
        return User.builder()
                .id(7L)
                .email("developer@assettrack.com")
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build();
    }
}
