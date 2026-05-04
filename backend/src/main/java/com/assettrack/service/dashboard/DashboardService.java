package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;

    public DashboardSummaryDto getSummary() {
        long totalAssets = assetRepository.count();

        Map<AssetStatus, Long> statusCounts = assetRepository.countByStatus().stream()
                .collect(Collectors.toMap(AssetRepository.StatusCount::getStatus, AssetRepository.StatusCount::getCount));

        List<String> statusLabels = Arrays.stream(AssetStatus.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        List<Long> statusData = Arrays.stream(AssetStatus.values())
                .map(s -> statusCounts.getOrDefault(s, 0L))
                .collect(Collectors.toList());

        Map<AssetType, Long> typeCounts = assetRepository.countByType().stream()
                .collect(Collectors.toMap(AssetRepository.TypeCount::getType, AssetRepository.TypeCount::getCount));

        List<String> typeLabels = Arrays.stream(AssetType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        List<Long> typeData = Arrays.stream(AssetType.values())
                .map(t -> typeCounts.getOrDefault(t, 0L))
                .collect(Collectors.toList());

        return new DashboardSummaryDto(
                totalAssets,
                new DashboardSummaryDto.ChartData(statusLabels, statusData),
                new DashboardSummaryDto.ChartData(typeLabels, typeData)
        );
    }

    public QuickSpareAssetDto getQuickSpareLaptop() {
        return assetRepository.findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE)
                .map(a -> new QuickSpareAssetDto(a.getId(), a.getType().name(), a.getStatus().name()))
                .orElseThrow(() -> new ResourceNotFoundException("No available spare laptop found."));
    }
}
