package com.assettrack.service.allocation;

import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;

import java.util.List;
import java.util.UUID;

public interface IAllocationService {

    AllocationResponseDto allocate(AllocationRequestDto dto);

    AllocationResponseDto getAllocationById(UUID allocationId,UUID assetId);
    
    void deallocate(java.util.UUID assetId);

    List<AllocationHistoryDto> getAllocationHistory(java.util.UUID assetId);
}
