package com.assettrack.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalAssets;
    private List<StatusCountDto> byStatus;
    private List<TypeCountDto> byType;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCountDto {
        private String status;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeCountDto {
        private String type;
        private long count;
    }
}
