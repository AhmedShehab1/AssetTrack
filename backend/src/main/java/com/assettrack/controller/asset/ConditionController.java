package com.assettrack.controller.asset;

import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.dto.asset.ReportConditionRequest;
import com.assettrack.dto.asset.UpdateConditionReportRequest;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.service.asset.IAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
@Tag(name = "Condition Reports", description = "Asset condition reporting endpoints")
public class ConditionController {

    private final IAssetService assetService;

    @PostMapping("/{assetId}/condition-reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a condition report for an asset", description = "Creates a condition report for the asset in the path. The reporter is derived from the authenticated user.")
    @ApiResponse(responseCode = "201", description = "Condition report created", content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "403", description = "Forbidden when a regular user does not own the asset")
    @ApiResponse(responseCode = "404", description = "Asset not found")
    @ApiResponse(responseCode = "422", description = "Validation error")
    public ResponseEntity<ConditionReportResponse> reportAssetCondition(
            @Parameter(description = "Asset ID") @PathVariable UUID assetId,
            @RequestBody @Validated ReportConditionRequest request,
            Authentication authentication) {
        ConditionReportResponse response = assetService.createConditionReport(
                assetId,
                request.getDescription(),
                request.getSeverity(),
                authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/condition-reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "File a condition report", description = "Legacy endpoint for creating a condition report using an asset ID in the request body.")
    @ApiResponse(responseCode = "201", description = "Condition report created", content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "403", description = "Forbidden when a regular user does not own the asset")
    @ApiResponse(responseCode = "404", description = "Asset not found")
    @ApiResponse(responseCode = "422", description = "Validation error")
    public ResponseEntity<ConditionReportResponse> createConditionReport(
            @RequestBody @Validated CreateConditionReportRequest request,
            Authentication authentication) {
        ConditionReportResponse response = assetService.createConditionReport(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/condition-reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List condition reports", description = "Managers and admins see all reports. Regular users see only reports they submitted.")
    @ApiResponse(responseCode = "200", description = "Reports retrieved")
    public ResponseEntity<PagedResponse<ConditionReportResponse>> getConditionReports(Authentication authentication, Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(assetService.getConditionReports(authentication, pageable)));
    }

    @GetMapping("/{assetId}/condition-reports")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List condition reports for an asset", description = "Managers and admins see all reports for the asset. Regular users see only reports they submitted.")
    @ApiResponse(responseCode = "200", description = "Reports retrieved")
    @ApiResponse(responseCode = "404", description = "Asset not found")
    public ResponseEntity<PagedResponse<ConditionReportResponse>> getReportsByAsset(
            @Parameter(description = "Asset ID") @PathVariable UUID assetId,
            Authentication authentication, Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(assetService.getReportsByAsset(assetId, authentication, pageable)));
    }

    @GetMapping("/condition-reports/{reportId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get a specific condition report", description = "Managers and admins can view any report. Regular users can view only their own reports.")
    @ApiResponse(responseCode = "200", description = "Report found", content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "403", description = "Forbidden when a regular user does not own the report")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<ConditionReportResponse> getConditionReport(
            @Parameter(description = "Condition Report ID") @PathVariable UUID reportId,
            Authentication authentication) {
        return ResponseEntity.ok(assetService.getReportById(reportId, authentication));
    }

    @PatchMapping("/condition-reports/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Resolve a condition report", description = "Marks a condition report as RESOLVED (Admin or Manager only)")
    @ApiResponse(responseCode = "200", description = "Report resolved", content = @Content(schema = @Schema(implementation = ConditionReportResponse.class)))
    @ApiResponse(responseCode = "404", description = "Report not found")
    @ApiResponse(responseCode = "403", description = "Forbidden when Admin or Manager role is missing")
    public ResponseEntity<ConditionReportResponse> resolveReport(
            @Parameter(description = "Condition Report ID") @PathVariable UUID reportId) {
        return ResponseEntity.ok(assetService.resolveReport(reportId));
    }
    
    // GET /assets/{assetId}/condition-reports/{reportId}
    @GetMapping("/{assetId}/condition-reports/{reportId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConditionReportResponse> getConditionReport(
            @PathVariable UUID assetId,
            @PathVariable UUID reportId,
            Authentication authentication) {
        return ResponseEntity.ok(assetService.getReportById(reportId, authentication));
    }

    // PATCH /assets/{assetId}/condition-reports/{reportId}
    @PatchMapping("/{assetId}/condition-reports/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ConditionReportResponse> updateConditionReport(
            @PathVariable UUID assetId,
            @PathVariable UUID reportId,
            @RequestBody @Validated UpdateConditionReportRequest request) {
        return ResponseEntity.ok(assetService.updateConditionReport(reportId, request));
    }
}
