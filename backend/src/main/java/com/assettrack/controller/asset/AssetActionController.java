package com.assettrack.controller.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.SpareAssetResponse;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.service.asset.IAssetService;
import com.assettrack.service.dashboard.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Asset Search Controller for AssetTrack.
 *
 * Provides advanced search capabilities for assets with multi-field filtering
 * and spare asset lookup.
 * Note: Functionality overlaps with {@link AssetController} - consider
 * consolidation.
 *
 * Base URL: {@code /api/v1/search/assets}
 */
@RestController
@RequestMapping("/search/assets")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Advanced multi-field asset and user search")
public class AssetActionController {

    private final IDashboardService dashboardService;
    private final IAssetService assetService;

    // ──────────────────────────── Asset Search ────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search assets", description = "Dynamic asset search with optional filters for status, type, brand, and serial number. All parameters are optional and composable.")
    @ApiResponse(responseCode = "200", description = "Search results returned")
    /**
     * Searches assets using optional filters.
     *
     * @param status       optional status filter
     * @param type         optional type filter
     * @param brand        optional brand filter
     * @param serialNumber optional serial number filter
     * @param pageable     pagination parameters
     * @return paged asset response
     */
    public ResponseEntity<PagedResponse<AssetResponse>> searchAssets(
            @Parameter(description = "Filter by status (AVAILABLE, ALLOCATED, UNDER_REPAIR, DECOMMISSIONED, SPARE, EXPIRED)") @RequestParam(required = false) AssetStatus status,
            @Parameter(description = "Filter by type (LAPTOP, MONITOR, KEYBOARD, MOUSE, HEADSET, DOCKING_STATION, OTHER)") @RequestParam(required = false) AssetType type,
            @Parameter(description = "Filter by brand (case-insensitive partial match)") @RequestParam(required = false) String brand,
            @Parameter(description = "Filter by exact serial number") @RequestParam(required = false) String serialNumber,
            Pageable pageable) {
        return ResponseEntity
                .ok(PageUtils.toPagedResponse(assetService.searchAssets(status, type, brand, serialNumber, pageable)));
    }

    @GetMapping("/spare-laptop")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a quick spare laptop", description = "Returns the oldest available laptop asset for quick allocation")
    @ApiResponse(responseCode = "200", description = "Spare asset found", content = @Content(schema = @Schema(implementation = SpareAssetResponse.class)))
    @ApiResponse(responseCode = "404", description = "No available spare asset")
    /**
     * Returns the quickest available spare laptop.
     *
     * @return spare asset response
     */
    public ResponseEntity<SpareAssetResponse> getQuickSpareLaptop() {
        return ResponseEntity.ok(dashboardService.getQuickSpareLaptop());
    }
}
