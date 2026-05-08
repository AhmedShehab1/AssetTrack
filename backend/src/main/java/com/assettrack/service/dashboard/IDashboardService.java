package com.assettrack.service.dashboard;

import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.dashboard.DashboardSummaryDto;

public interface IDashboardService {
    DashboardSummaryDto getSummary();

    SpareAssetResponse getQuickSpareLaptop();
}