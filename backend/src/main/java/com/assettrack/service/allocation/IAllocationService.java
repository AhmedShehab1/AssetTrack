package com.assettrack.service.allocation;

import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;

import java.util.List;

public interface IAllocationService {

    AllocationResponseDto allocate(AllocationRequestDto dto);

    void deallocate(java.util.UUID assetId);

    List<AllocationHistoryDto> getAllocationHistory(java.util.UUID assetId);
}
