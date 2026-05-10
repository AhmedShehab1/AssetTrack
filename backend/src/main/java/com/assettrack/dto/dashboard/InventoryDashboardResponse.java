package com.assettrack.dto.dashboard;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryDashboardResponse {

    private long totalAssets;
    private List<StatusCountDto> byStatus;
    private List<TypeCountDto> byType;
    private long expiringWithin30Days;
    private long alreadyExpired;
    private long openConditionReports;
    private long unallocatedLaptops;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatusCountDto {
        private AssetStatus status;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TypeCountDto {
        private AssetType type;
        private long count;
    }
}