package com.assettrack.service.assets;

import com.assettrack.dto.assetallocation.AllocationHistoryDto;
import com.assettrack.dto.assetallocation.AllocationRequestDto;
import com.assettrack.dto.assetallocation.AllocationResponseDto;

import java.util.List;

public interface IAllocationService {
    AllocationResponseDto allocate(AllocationRequestDto dto);

    void deallocate(Long assetId);

    List<AllocationHistoryDto> getAllocationHistory(Long assetId);
}
