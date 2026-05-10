package com.assettrack.controller.asset;

import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.service.allocation.IAllocationService;
import com.assettrack.service.asset.IAssetService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Usage statistics and allocation history")
public class ReportsController {

    private final IAllocationService allocationService;
    private final IAssetService assetService;

    @GetMapping("/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PagedResponse<AllocationHistoryDto>> getAllocationReport(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) AssetType assetType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean activeOnly,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(
                allocationService.getGlobalAllocationReport(userId, assetType, from, to, activeOnly, pageable)));
    }

    @GetMapping("/condition-reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PagedResponse<ConditionReportResponse>> getConditionReportSummary(
            @RequestParam(required = false) ConditionReportStatus status,
            @RequestParam(required = false) ConditionSeverity severity,
            @RequestParam(required = false) AssetType assetType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(
                assetService.getConditionReports(authentication, pageable)));
    }
}