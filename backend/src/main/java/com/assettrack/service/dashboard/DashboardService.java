package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService implements IDashboardService {

        private final AssetRepository assetRepository;
        private final AssetMapper assetMapper;
        private final UserMapper userMapper;

        public DashboardSummaryDto getSummary() {
                long totalAssets = assetRepository.count();

                Map<AssetStatus, Long> statusCounts = assetRepository.countByStatus().stream()
                                .collect(Collectors.toMap(AssetRepository.StatusCount::getStatus,
                                                AssetRepository.StatusCount::getCount));

                List<DashboardSummaryDto.StatusCountDto> byStatus = Arrays.stream(AssetStatus.values())
                                .map(s -> new DashboardSummaryDto.StatusCountDto(s, statusCounts.getOrDefault(s, 0L)))
                                .collect(Collectors.toList());

                Map<AssetType, Long> typeCounts = assetRepository.countByType().stream()
                                .collect(Collectors.toMap(AssetRepository.TypeCount::getType,
                                                AssetRepository.TypeCount::getCount));

                List<DashboardSummaryDto.TypeCountDto> byType = Arrays.stream(AssetType.values())
                                .map(t -> new DashboardSummaryDto.TypeCountDto(t, typeCounts.getOrDefault(t, 0L)))
                                .collect(Collectors.toList());

                return new DashboardSummaryDto(
                                totalAssets,
                                byStatus,
                                byType,
                                0L,
                                0L,
                                0L,
                                0L);
        }

        @Transactional(readOnly = true)
        public SpareAssetResponse getQuickSpareLaptop() {
                return assetRepository
                                .findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE)
                                .map(asset -> new SpareAssetResponse(
                                                assetMapper.toResponse(asset),
                                                resolveLastOwner(asset),
                                                resolveLastDeallocatedAt(asset)))
                                .orElseThrow(() -> new ResourceNotFoundException("No available spare laptop found."));
        }

        private UserSummary resolveLastOwner(com.assettrack.domain.asset.Asset asset) {
                AssetAllocation allocation = resolveLatestAllocation(asset);
                return allocation == null ? null : userMapper.toSummary(allocation.getUser());
        }

        private java.time.LocalDateTime resolveLastDeallocatedAt(com.assettrack.domain.asset.Asset asset) {
                AssetAllocation allocation = resolveLatestAllocation(asset);
                return allocation == null ? null : allocation.getReturnDate();
        }

        private AssetAllocation resolveLatestAllocation(com.assettrack.domain.asset.Asset asset) {
                if (asset == null || asset.getAllocations() == null || asset.getAllocations().isEmpty()) {
                        return null;
                }
                return asset.getAllocations().get(0);
        }
}
