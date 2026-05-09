package com.assettrack.dto.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard summary response containing inventory and health metrics.
 */
@Data
@NoArgsConstructor
public class DashboardSummaryDto {
    /** Total number of assets in the system. */
    private long totalAssets;
    /** Counts grouped by asset status. */
    private List<StatusCountDto> byStatus;
    /** Counts grouped by asset type. */
    private List<TypeCountDto> byType;
    /** Assets expiring within the next 30 days. */
    private long expiringWithin30Days;
    /** Assets whose warranty has already expired. */
    private long alreadyExpired;
    /** Open condition reports awaiting action. */
    private long openConditionReports;
    /** Unallocated laptops available for assignment. */
    private long unallocatedLaptops;

    public DashboardSummaryDto(long totalAssets,
            List<StatusCountDto> byStatus,
            List<TypeCountDto> byType,
            long expiringWithin30Days,
            long alreadyExpired,
            long openConditionReports,
            long unallocatedLaptops) {
        this.totalAssets = totalAssets;
        this.byStatus = byStatus;
        this.byType = byType;
        this.expiringWithin30Days = expiringWithin30Days;
        this.alreadyExpired = alreadyExpired;
        this.openConditionReports = openConditionReports;
        this.unallocatedLaptops = unallocatedLaptops;
    }

    @Data
    @NoArgsConstructor
    public static class StatusCountDto {
        /** Asset status bucket. */
        private AssetStatus status;
        /** Number of assets in this bucket. */
        private long count;

        public StatusCountDto(AssetStatus status, long count) {
            this.status = status;
            this.count = count;
        }
    }

    @Data
    @NoArgsConstructor
    public static class TypeCountDto {
        /** Asset type bucket. */
        private AssetType type;
        /** Number of assets in this bucket. */
        private long count;

        public TypeCountDto(AssetType type, long count) {
            this.type = type;
            this.count = count;
        }
    }
}
