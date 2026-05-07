package com.assettrack.service.asset;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

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

    private User testUser() {
        return User.builder()
                .id(7L)
                .email("developer@assettrack.com")
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build();
    }
}
