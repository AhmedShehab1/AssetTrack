package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getSummary_ReturnsCorrectSummary() {
        when(assetRepository.count()).thenReturn(10L);

        AssetRepository.StatusCount sc1 = new AssetRepository.StatusCount() {
            @Override public AssetStatus getStatus() { return AssetStatus.AVAILABLE; }
            @Override public Long getCount() { return 6L; }
        };
        AssetRepository.StatusCount sc2 = new AssetRepository.StatusCount() {
            @Override public AssetStatus getStatus() { return AssetStatus.ALLOCATED; }
            @Override public Long getCount() { return 4L; }
        };
        when(assetRepository.countByStatus()).thenReturn(List.of(sc1, sc2));

        AssetRepository.TypeCount tc1 = new AssetRepository.TypeCount() {
            @Override public AssetType getType() { return AssetType.LAPTOP; }
            @Override public Long getCount() { return 8L; }
        };
        AssetRepository.TypeCount tc2 = new AssetRepository.TypeCount() {
            @Override public AssetType getType() { return AssetType.SCREEN; }
            @Override public Long getCount() { return 2L; }
        };
        when(assetRepository.countByType()).thenReturn(List.of(tc1, tc2));

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertThat(summary.getTotalAssets()).isEqualTo(10L);

        List<String> statusLabels = summary.getStatusDistribution().getLabels();
        List<Long> statusData = summary.getStatusDistribution().getData();
        assertThat(statusLabels).containsExactly("AVAILABLE", "ALLOCATED", "EXPIRED");
        assertThat(statusData.get(statusLabels.indexOf("AVAILABLE"))).isEqualTo(6L);
        assertThat(statusData.get(statusLabels.indexOf("ALLOCATED"))).isEqualTo(4L);
        assertThat(statusData.get(statusLabels.indexOf("EXPIRED"))).isEqualTo(0L);

        List<String> typeLabels = summary.getTypeDistribution().getLabels();
        List<Long> typeData = summary.getTypeDistribution().getData();
        assertThat(typeLabels).containsExactly("LAPTOP", "SCREEN", "ACCESSORY");
        assertThat(typeData.get(typeLabels.indexOf("LAPTOP"))).isEqualTo(8L);
        assertThat(typeData.get(typeLabels.indexOf("SCREEN"))).isEqualTo(2L);
        assertThat(typeData.get(typeLabels.indexOf("ACCESSORY"))).isEqualTo(0L);
    }

    @Test
    void getQuickSpareLaptop_WhenFound_ReturnsAsset() {
        Asset laptop = new Asset();
        laptop.setId(1L);
        laptop.setType(AssetType.LAPTOP);
        laptop.setStatus(AssetStatus.AVAILABLE);

        when(assetRepository.findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE))
                .thenReturn(Optional.of(laptop));

        QuickSpareAssetDto result = dashboardService.getQuickSpareLaptop();
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo("LAPTOP");
        assertThat(result.getStatus()).isEqualTo("AVAILABLE");
    }

    @Test
    void getQuickSpareLaptop_WhenNotFound_ThrowsException() {
        when(assetRepository.findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> dashboardService.getQuickSpareLaptop())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No available spare laptop found");
    }
}
