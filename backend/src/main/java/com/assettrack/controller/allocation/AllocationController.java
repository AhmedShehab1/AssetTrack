package com.assettrack.controller.allocation;

import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import com.assettrack.service.allocation.IAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/assets/{assetId}/allocations")
@RequiredArgsConstructor
@RestController
public class AllocationController {
    private final IAllocationService allocationService;

    @GetMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocations(@PathVariable UUID assetId) {

        return ResponseEntity.ok(allocationService.getAllocationHistory(assetId));

    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<AllocationResponseDto> allocate(@PathVariable UUID assetId,
            @RequestBody @Validated AllocationRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allocationService.allocate(assetId, requestDto));
    }

    @GetMapping("/{allocationId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<AllocationResponseDto> getAllocation(@PathVariable UUID assetId,
            @PathVariable UUID allocationId) {
        return ResponseEntity.ok(allocationService.getAllocationById(allocationId, assetId));
    }

    @PostMapping("/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deallocate(@PathVariable UUID assetId) {
        allocationService.deallocate(assetId);
        return ResponseEntity.noContent().build();
    }
}
