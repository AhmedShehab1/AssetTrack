package com.assettrack.controller.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
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
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Asset management, search, and condition reporting endpoints")
public class AssetActionController {

    private final DashboardService dashboardService;
    private final AssetService assetService;

    // ──────────────────────────── Asset Search ────────────────────────────

    @GetMapping("/search")
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

    @GetMapping("/quick-spare")
    @Operation(summary = "Get a quick spare laptop", description = "Returns the oldest available laptop asset for quick allocation")
    @ApiResponse(responseCode = "200", description = "Spare asset found",
            content = @Content(schema = @Schema(implementation = QuickSpareAssetDto.class)))
    @ApiResponse(responseCode = "404", description = "No available spare asset")
    public ResponseEntity<QuickSpareAssetDto> getQuickSpareLaptop() {
        return ResponseEntity.ok(dashboardService.getQuickSpareLaptop());
    }

    // ──────────────────────── Condition Reports ──────────────────────────

    @PostMapping("/condition-reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "File a condition report", description = "Creates a new condition report for an asset. The reporter is derived from the authenticated user.")
    @ApiResponse(responseCode = "201", description = "Condition report created",
            content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "404", description = "Asset not found")
    @ApiResponse(responseCode = "422", description = "Validation error")
    public ResponseEntity<ConditionReportResponse> createConditionReport(
            @RequestBody @Validated CreateConditionReportRequest request,
            Authentication authentication) {
        ConditionReportResponse response = assetService.createConditionReport(request, authentication);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{assetId}/condition-reports")
    @Operation(summary = "Get condition reports for an asset", description = "Returns all condition reports filed against a specific asset, newest first")
    @ApiResponse(responseCode = "200", description = "Reports retrieved")
    @ApiResponse(responseCode = "404", description = "Asset not found")
    public ResponseEntity<List<ConditionReportResponse>> getReportsByAsset(
            @Parameter(description = "Asset ID") @PathVariable Long assetId) {
        return ResponseEntity.ok(assetService.getReportsByAsset(assetId));
    }

    @GetMapping("/condition-reports/{reportId}")
    @Operation(summary = "Get a condition report", description = "Returns a single condition report by ID")
    @ApiResponse(responseCode = "200", description = "Report found",
            content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<ConditionReportResponse> getConditionReport(
            @Parameter(description = "Condition Report ID") @PathVariable Long reportId) {
        return ResponseEntity.ok(assetService.getReportById(reportId));
    }

    @PatchMapping("/condition-reports/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Resolve a condition report", description = "Marks a condition report as RESOLVED (Admin or Manager only)")
    @ApiResponse(responseCode = "200", description = "Report resolved",
            content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "404", description = "Report not found")
    @ApiResponse(responseCode = "403", description = "Forbidden – Admin or Manager role required")
    public ResponseEntity<ConditionReportResponse> resolveReport(
            @Parameter(description = "Condition Report ID") @PathVariable Long reportId) {
        return ResponseEntity.ok(assetService.resolveReport(reportId));
    }
}
