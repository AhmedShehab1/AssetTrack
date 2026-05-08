package com.assettrack.dto.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DashboardSummaryDto {
    private long totalAssets;
    private List<StatusCountDto> byStatus;
    private List<TypeCountDto> byType;
    private long expiringWithin30Days;
    private long alreadyExpired;
    private long openConditionReports;
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
        private AssetStatus status;
        private long count;

        public StatusCountDto(AssetStatus status, long count) {
            this.status = status;
            this.count = count;
        }
    }

    @Data
    @NoArgsConstructor
    public static class TypeCountDto {
        private AssetType type;
        private long count;

        public TypeCountDto(AssetType type, long count) {
            this.type = type;
            this.count = count;
        }
    }
}
