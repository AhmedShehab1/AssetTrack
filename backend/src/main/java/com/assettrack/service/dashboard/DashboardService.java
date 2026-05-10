package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.dto.asset.ExpiringAssetSummary;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.dashboard.InventoryDashboardResponse;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.mapper.user.UserMapper;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.service.asset.IAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        private final IAssetService assetService;
        private final AssetAllocationRepository allocationRepository;
        private final ConditionReportRepository conditionReportRepository;

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

        @Transactional(readOnly = true)
        public InventoryDashboardResponse getInventoryDashboard() {
                long totalAssets = assetRepository.count();

                Map<AssetStatus, Long> statusCounts = assetRepository.countByStatus().stream()
                        .collect(Collectors.toMap(
                                AssetRepository.StatusCount::getStatus,
                                AssetRepository.StatusCount::getCount));

                List<InventoryDashboardResponse.StatusCountDto> byStatus = Arrays.stream(AssetStatus.values())
                        .map(s -> new InventoryDashboardResponse.StatusCountDto(s, statusCounts.getOrDefault(s, 0L)))
                        .collect(Collectors.toList());

                Map<AssetType, Long> typeCounts = assetRepository.countByType().stream()
                        .collect(Collectors.toMap(
                                AssetRepository.TypeCount::getType,
                                AssetRepository.TypeCount::getCount));

                List<InventoryDashboardResponse.TypeCountDto> byType = Arrays.stream(AssetType.values())
                        .map(t -> new InventoryDashboardResponse.TypeCountDto(t, typeCounts.getOrDefault(t, 0L)))
                        .collect(Collectors.toList());

                LocalDate today = LocalDate.now();
                long expiringWithin30Days = assetRepository
                        .countByWarrantyExpirationDateBetween(today, today.plusDays(30));
                long alreadyExpired = assetRepository
                        .countByWarrantyExpirationDateLessThan(today);
                long openConditionReports = conditionReportRepository
                        .countByStatus(ConditionReportStatus.OPEN);
                long unallocatedLaptops = assetRepository
                        .countByTypeAndStatusIn(AssetType.LAPTOP,
                                List.of(AssetStatus.AVAILABLE, AssetStatus.SPARE));

                return new InventoryDashboardResponse(
                        totalAssets,
                        byStatus,
                        byType,
                        expiringWithin30Days,
                        alreadyExpired,
                        openConditionReports,
                        unallocatedLaptops
                );
        }

        // delegates to asset service — dashboard controller can also call asset service directly
        @Transactional(readOnly = true)
        public Page<ExpiringAssetSummary> getExpiringWarranties(int withinDays, Pageable pageable) {
                return assetService.getExpiringWarranties(withinDays, pageable);
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
