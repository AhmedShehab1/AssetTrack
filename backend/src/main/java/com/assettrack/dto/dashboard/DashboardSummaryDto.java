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
    private ChartData statusDistribution;
    private ChartData typeDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartData {
        private List<String> labels;
        private List<Long> data;
    }
}
