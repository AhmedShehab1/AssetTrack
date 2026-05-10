package com.assettrack.controller.allocation;

import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import com.assettrack.dto.common.PageUtils;
import com.assettrack.dto.common.PagedResponse;
import com.assettrack.service.allocation.IAllocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/assets/{assetId}/allocations")
@RequiredArgsConstructor
@RestController
@Tag(name = "Allocations", description = "Asset allocation management endpoints")
public class AllocationController {
    private final IAllocationService allocationService;

    @GetMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get full allocation history for an asset", description = "Returns the complete chronological allocation history, newest first.")
    @ApiResponse(responseCode = "200", description = "History retrieved")
    public ResponseEntity<PagedResponse<AllocationHistoryDto>> getAllocations(
            @PathVariable UUID assetId,
            Pageable pageable) {
        return ResponseEntity.ok(PageUtils.toPagedResponse(allocationService.getAllocationHistory(assetId, pageable)));
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Allocate an asset", description = "Assigns an available asset to a user.")
    @ApiResponse(responseCode = "201", description = "Allocation created")
    public ResponseEntity<AllocationResponseDto> allocate(@PathVariable UUID assetId,
            @RequestBody @Validated AllocationRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allocationService.allocate(assetId, requestDto));
    }

    @GetMapping("/{allocationId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get a specific allocation", description = "Returns details of a specific allocation record.")
    @ApiResponse(responseCode = "200", description = "Allocation found")
    public ResponseEntity<AllocationResponseDto> getAllocation(@PathVariable UUID assetId,
            @PathVariable UUID allocationId) {
        return ResponseEntity.ok(allocationService.getAllocationById(allocationId, assetId));
    }

    @PostMapping("/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Deallocate an asset", description = "Marks the current allocation as ended.")
    @ApiResponse(responseCode = "204", description = "Asset deallocated")
    public ResponseEntity<Void> deallocate(@PathVariable UUID assetId) {
        allocationService.deallocate(assetId);
        return ResponseEntity.noContent().build();
    }
    // Change from /deallocate to /{allocationId}/deallocate
    @PostMapping("/{allocationId}/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deallocate(
            @PathVariable UUID assetId,
            @PathVariable UUID allocationId) {
        allocationService.deallocate(assetId);
        return ResponseEntity.noContent().build();
    }
}
