package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;

    public DashboardSummaryDto getSummary() {
        long totalAssets = assetRepository.count();

        Map<String, Long> statusDistribution = assetRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                        sc -> sc.getStatus().name(),
                        AssetRepository.StatusCount::getCount
                ));

        Map<String, Long> typeDistribution = assetRepository.countByType().stream()
                .collect(Collectors.toMap(
                        tc -> tc.getType().name(),
                        AssetRepository.TypeCount::getCount
                ));

        return new DashboardSummaryDto(totalAssets, statusDistribution, typeDistribution);
    }

    public Asset getQuickSpareLaptop() {
        return assetRepository.findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE)
                .orElseThrow(() -> new ResourceNotFoundException("No available spare laptop found."));
    }
}
