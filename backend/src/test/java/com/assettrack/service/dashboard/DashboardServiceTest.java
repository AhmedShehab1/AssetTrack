package com.assettrack.service.dashboard;

import java.util.UUID;
import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.mapper.user.UserMapper;
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

    @Mock
    private AssetMapper assetMapper;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getSummary_ReturnsCorrectSummary() {
        when(assetRepository.count()).thenReturn(10L);

        AssetRepository.StatusCount sc1 = new AssetRepository.StatusCount() {
            @Override
            public AssetStatus getStatus() {
                return AssetStatus.AVAILABLE;
            }

            @Override
            public Long getCount() {
                return 6L;
            }
        };
        AssetRepository.StatusCount sc2 = new AssetRepository.StatusCount() {
            @Override
            public AssetStatus getStatus() {
                return AssetStatus.ALLOCATED;
            }

            @Override
            public Long getCount() {
                return 4L;
            }
        };
        when(assetRepository.countByStatus()).thenReturn(List.of(sc1, sc2));

        AssetRepository.TypeCount tc1 = new AssetRepository.TypeCount() {
            @Override
            public AssetType getType() {
                return AssetType.LAPTOP;
            }

            @Override
            public Long getCount() {
                return 8L;
            }
        };
        AssetRepository.TypeCount tc2 = new AssetRepository.TypeCount() {
            @Override
            public AssetType getType() {
                return AssetType.MONITOR;
            }

            @Override
            public Long getCount() {
                return 2L;
            }
        };
        when(assetRepository.countByType()).thenReturn(List.of(tc1, tc2));

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertThat(summary.getTotalAssets()).isEqualTo(10L);

        List<AssetStatus> statusLabels = summary.getByStatus().stream()
                .map(DashboardSummaryDto.StatusCountDto::getStatus).toList();
        List<Long> statusData = summary.getByStatus().stream().map(DashboardSummaryDto.StatusCountDto::getCount)
                .toList();
        assertThat(statusLabels).containsExactly(AssetStatus.AVAILABLE, AssetStatus.ALLOCATED, AssetStatus.UNDER_REPAIR,
                AssetStatus.DECOMMISSIONED, AssetStatus.SPARE, AssetStatus.EXPIRED);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.AVAILABLE))).isEqualTo(6L);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.ALLOCATED))).isEqualTo(4L);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.UNDER_REPAIR))).isEqualTo(0L);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.DECOMMISSIONED))).isEqualTo(0L);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.SPARE))).isEqualTo(0L);
        assertThat(statusData.get(statusLabels.indexOf(AssetStatus.EXPIRED))).isEqualTo(0L);

        List<AssetType> typeLabels = summary.getByType().stream().map(DashboardSummaryDto.TypeCountDto::getType)
                .toList();
        List<Long> typeData = summary.getByType().stream().map(DashboardSummaryDto.TypeCountDto::getCount).toList();
        assertThat(typeLabels).containsExactly(AssetType.LAPTOP, AssetType.MONITOR, AssetType.KEYBOARD, AssetType.MOUSE,
                AssetType.HEADSET, AssetType.DOCKING_STATION, AssetType.OTHER);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.LAPTOP))).isEqualTo(8L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.MONITOR))).isEqualTo(2L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.KEYBOARD))).isEqualTo(0L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.MOUSE))).isEqualTo(0L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.HEADSET))).isEqualTo(0L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.DOCKING_STATION))).isEqualTo(0L);
        assertThat(typeData.get(typeLabels.indexOf(AssetType.OTHER))).isEqualTo(0L);
    }

    @Test
    void getQuickSpareLaptop_WhenFound_ReturnsAsset() {
        Asset laptop = new Asset();
        laptop.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        laptop.setType(AssetType.LAPTOP);
        laptop.setStatus(AssetStatus.AVAILABLE);

        when(assetRepository.findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE))
                .thenReturn(Optional.of(laptop));
        when(assetMapper.toResponse(laptop)).thenReturn(com.assettrack.dto.asset.AssetResponse.builder()
                .id(laptop.getId())
                .type(AssetType.LAPTOP)
                .status(AssetStatus.AVAILABLE)
                .build());

        SpareAssetResponse result = dashboardService.getQuickSpareLaptop();
        assertThat(result).isNotNull();
        assertThat(result.getAsset().getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        assertThat(result.getAsset().getType()).isEqualTo(AssetType.LAPTOP);
        assertThat(result.getAsset().getStatus()).isEqualTo(AssetStatus.AVAILABLE);
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
