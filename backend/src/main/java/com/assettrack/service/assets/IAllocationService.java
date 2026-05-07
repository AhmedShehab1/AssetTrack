package com.assettrack.service.assets;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.dto.assetallocation.AllocationHistoryDto;
import com.assettrack.dto.assetallocation.AllocationRequestDto;
import com.assettrack.dto.assetallocation.AllocationResponseDto;
import com.assettrack.repository.asset.AssetAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public interface AllocationService {
    private final AssetAllocationRepository assetAllocationRepository;

    public AllocationResponseDto allocate(AllocationRequestDto dto);
    void deallocate(Long assetId);
    List<AllocationHistoryDto> getAllocationHistory(Long assetId);
}
