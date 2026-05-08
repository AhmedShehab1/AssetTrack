package com.assettrack.service.asset;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
                .id(UUID.fromString("00000000-0000-0000-0000-000000000010"))
                .asset(com.assettrack.dto.asset.AssetResponse.builder().id(asset.getId()).build())
                .reportedBy(com.assettrack.dto.user.UserResponse.builder().id(reporter.getId()).build())
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
        ConditionReport report = testReport(UUID.fromString("00000000-0000-0000-0000-000000000001"), testUser(UUID.fromString("00000000-0000-0000-0000-000000000007")));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(UUID.fromString("00000000-0000-0000-0000-000000000001")).build();
        Pageable pageable = PageRequest.of(0, 10);
        Page<ConditionReport> page = new PageImpl<>(List.of(report));

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(UUID.fromString("00000000-0000-0000-0000-000000000007"));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(true);
        when(conditionReportRepository.findAllByOrderByReportDateDesc(pageable)).thenReturn(page);
        when(assetMapper.toResponse(report)).thenReturn(mapped);

        Page<ConditionReportResponse> result = assetService.getConditionReports(authentication, pageable);

        assertThat(result.getContent()).containsExactly(mapped);
        verify(conditionReportRepository).findAllByOrderByReportDateDesc(pageable);
        verify(conditionReportRepository, never()).findByReportedByIdOrderByReportDateDesc(any(), any());
    }

    @Test
    void getConditionReports_WhenRegularUser_ReturnsOnlyOwnReports() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000007");
        ConditionReport ownReport = testReport(UUID.fromString("00000000-0000-0000-0000-000000000001"), testUser(userId));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(UUID.fromString("00000000-0000-0000-0000-000000000001")).build();
        Pageable pageable = PageRequest.of(0, 10);
        Page<ConditionReport> page = new PageImpl<>(List.of(ownReport));

        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(conditionReportRepository.findByReportedByIdOrderByReportDateDesc(userId, pageable)).thenReturn(page);
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        Page<ConditionReportResponse> result = assetService.getConditionReports(authentication, pageable);

        assertThat(result.getContent()).containsExactly(mapped);
        verify(conditionReportRepository).findByReportedByIdOrderByReportDateDesc(userId, pageable);
        verify(conditionReportRepository, never()).findAllByOrderByReportDateDesc(any());
    }

    @Test
    void getReportsByAsset_WhenManagerOrAdmin_ReturnsAllAssetReports() {
        UUID assetId = UUID.fromString("00000000-0000-0000-0000-000000000099");
        ConditionReport report = testReport(UUID.fromString("00000000-0000-0000-0000-000000000001"), testUser(UUID.fromString("00000000-0000-0000-0000-000000000008")));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(UUID.fromString("00000000-0000-0000-0000-000000000001")).asset(com.assettrack.dto.asset.AssetResponse.builder().id(assetId).build()).build();
        Pageable pageable = PageRequest.of(0, 10);
        Page<ConditionReport> page = new PageImpl<>(List.of(report));

        when(assetRepository.existsById(assetId)).thenReturn(true);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(UUID.fromString("00000000-0000-0000-0000-000000000007"));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(true);
        when(conditionReportRepository.findByAssetIdOrderByReportDateDesc(assetId, pageable)).thenReturn(page);
        when(assetMapper.toResponse(report)).thenReturn(mapped);

        Page<ConditionReportResponse> result = assetService.getReportsByAsset(assetId, authentication, pageable);

        assertThat(result.getContent()).containsExactly(mapped);
        verify(conditionReportRepository).findByAssetIdOrderByReportDateDesc(assetId, pageable);
        verify(conditionReportRepository, never())
                .findByAssetIdAndReportedByIdOrderByReportDateDesc(any(), any(), any());
    }

    @Test
    void getReportsByAsset_WhenRegularUser_ReturnsOnlyOwnAssetReports() {
        UUID assetId = UUID.fromString("00000000-0000-0000-0000-000000000099");
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000007");
        ConditionReport ownReport = testReport(UUID.fromString("00000000-0000-0000-0000-000000000001"), testUser(userId));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(UUID.fromString("00000000-0000-0000-0000-000000000001")).asset(com.assettrack.dto.asset.AssetResponse.builder().id(assetId).build()).build();
        Pageable pageable = PageRequest.of(0, 10);
        Page<ConditionReport> page = new PageImpl<>(List.of(ownReport));

        when(assetRepository.existsById(assetId)).thenReturn(true);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(conditionReportRepository.findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId, pageable))
                .thenReturn(page);
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        Page<ConditionReportResponse> result = assetService.getReportsByAsset(assetId, authentication, pageable);

        assertThat(result.getContent()).containsExactly(mapped);
        verify(conditionReportRepository).findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId, pageable);
        verify(conditionReportRepository, never()).findByAssetIdOrderByReportDateDesc(any(), any());
    }

    @Test
    void getReportById_WhenManagerOrAdmin_CanViewAnyReport() {
        UUID reportId = UUID.fromString("00000000-0000-0000-0000-000000000044");
        ConditionReport report = testReport(reportId, testUser(UUID.fromString("00000000-0000-0000-0000-000000000099")));
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
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000007");
        UUID reportId = UUID.fromString("00000000-0000-0000-0000-000000000045");
        ConditionReport ownReport = testReport(reportId, testUser(userId));
        ConditionReportResponse mapped = ConditionReportResponse.builder().id(reportId).reportedBy(com.assettrack.dto.user.UserResponse.builder().id(userId).build()).build();

        when(conditionReportRepository.findById(reportId)).thenReturn(Optional.of(ownReport));
        when(securityUtils.isManagerOrAdmin(authentication)).thenReturn(false);
        when(securityUtils.getCurrentUserId(authentication)).thenReturn(userId);
        when(assetMapper.toResponse(ownReport)).thenReturn(mapped);

        ConditionReportResponse result = assetService.getReportById(reportId, authentication);

        assertThat(result).isEqualTo(mapped);
    }

    @Test
    void getReportById_WhenRegularUserViewsAnotherUsersReport_ThrowsForbidden() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000007");
        UUID reportId = UUID.fromString("00000000-0000-0000-0000-000000000046");
        ConditionReport othersReport = testReport(reportId, testUser(UUID.fromString("00000000-0000-0000-0000-000000000008")));

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
                .id(UUID.fromString("00000000-0000-0000-0000-000000000099"))
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude")
                .serialNumber("SN-OWN-001")
                .status(AssetStatus.ALLOCATED)
                .build();
    }

    private ConditionReport testReport(UUID reportId, User reporter) {
        return ConditionReport.builder()
                .id(reportId)
                .asset(testAsset())
                .reportedBy(reporter)
                .issueDescription("Battery no longer charges")
                .reportDate(LocalDate.now())
                .build();
    }

    private User testUser(UUID id) {
        User user = testUser();
        user.setId(id);
        return user;
    }

    private User testUser() {
        return User.builder()
                .id(UUID.fromString("00000000-0000-0000-0000-000000000007"))
                .email("developer@assettrack.com")
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build();
    }
}
