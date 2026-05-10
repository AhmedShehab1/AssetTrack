package com.assettrack.service.allocation;

import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface IAllocationService {

    AllocationResponseDto allocate(java.util.UUID assetId, AllocationRequestDto dto);

    AllocationResponseDto getAllocationById(UUID allocationId, UUID assetId);

    void deallocate(java.util.UUID assetId);

    Page<AllocationHistoryDto> getAllocationHistory(java.util.UUID assetId, Pageable pageable);

    // GET /reports/allocations
    Page<AllocationHistoryDto> getGlobalAllocationReport(
            UUID userId, AssetType assetType,
            LocalDate from, LocalDate to,
            Boolean activeOnly, Pageable pageable);
}
