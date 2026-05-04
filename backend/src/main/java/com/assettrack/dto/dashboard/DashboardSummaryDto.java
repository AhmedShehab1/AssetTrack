package com.assettrack.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalAssets;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> typeDistribution;
}
