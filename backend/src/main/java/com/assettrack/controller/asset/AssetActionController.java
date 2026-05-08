package com.assettrack.controller.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.service.asset.AssetService;
import com.assettrack.service.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Asset management and search endpoints")
public class AssetActionController {

    private final DashboardService dashboardService;
    private final AssetService assetService;

    // ──────────────────────────── Asset Search ────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search assets", description = "Dynamic asset search with optional filters for status, type, brand, and serial number. All parameters are optional and composable.")
    @ApiResponse(responseCode = "200", description = "Search results returned")
    public ResponseEntity<Page<AssetResponse>> searchAssets(
            @Parameter(description = "Filter by status (AVAILABLE, ALLOCATED, EXPIRED)")
            @RequestParam(required = false) AssetStatus status,
            @Parameter(description = "Filter by type (LAPTOP, SCREEN, ACCESSORY)")
            @RequestParam(required = false) AssetType type,
            @Parameter(description = "Filter by brand (case-insensitive partial match)")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Filter by exact serial number")
            @RequestParam(required = false) String serialNumber,
            Pageable pageable) {
        return ResponseEntity.ok(assetService.searchAssets(status, type, brand, serialNumber, pageable));
    }

    @GetMapping("/spare-laptop")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a quick spare laptop", description = "Returns the oldest available laptop asset for quick allocation")
    @ApiResponse(responseCode = "200", description = "Spare asset found",
            content = @Content(schema = @Schema(implementation = QuickSpareAssetDto.class)))
    @ApiResponse(responseCode = "404", description = "No available spare asset")
    public ResponseEntity<QuickSpareAssetDto> getQuickSpareLaptop() {
        return ResponseEntity.ok(dashboardService.getQuickSpareLaptop());
    }
}
