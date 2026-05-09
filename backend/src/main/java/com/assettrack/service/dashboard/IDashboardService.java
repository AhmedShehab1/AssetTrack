package com.assettrack.service.dashboard;

import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.dashboard.DashboardSummaryDto;

/**
 * Contract for dashboard summary and quick spare asset lookups.
 */
public interface IDashboardService {
    DashboardSummaryDto getSummary();

    SpareAssetResponse getQuickSpareLaptop();
}