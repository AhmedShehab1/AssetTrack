package com.assettrack.controller.dashboard;

import com.assettrack.dto.asset.ExpiringAssetSummary;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.dashboard.InventoryDashboardResponse;
import com.assettrack.service.dashboard.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard analytics and summary endpoints")
public class DashboardController {

    private final IDashboardService dashboardService;

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get inventory dashboard")
    @ApiResponse(responseCode = "200", description = "Dashboard data retrieved")
    public ResponseEntity<InventoryDashboardResponse> getInventoryDashboard() {
        return ResponseEntity.ok(dashboardService.getInventoryDashboard());
    }

    @GetMapping("/expiring-warranties")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "List assets with expiring or lapsed warranties")
    @ApiResponse(responseCode = "200", description = "Expiring assets retrieved")
    public ResponseEntity<PagedResponse<ExpiringAssetSummary>> getExpiringWarranties(
            @RequestParam(defaultValue = "30") int withinDays,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(dashboardService.getExpiringWarranties(withinDays, pageable)));
    }
}
