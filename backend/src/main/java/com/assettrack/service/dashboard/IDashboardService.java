package com.assettrack.service.dashboard;

import com.assettrack.dto.asset.ExpiringAssetSummary;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.dashboard.InventoryDashboardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IDashboardService {
    DashboardSummaryDto getSummary();

    SpareAssetResponse getQuickSpareLaptop();

    // GET /dashboard/inventory  (replaces/supplements getSummary)
    InventoryDashboardResponse getInventoryDashboard();

    // GET /dashboard/expiring-warranties  (delegates to IAssetService)
    Page<ExpiringAssetSummary> getExpiringWarranties(int withinDays, Pageable pageable);
}