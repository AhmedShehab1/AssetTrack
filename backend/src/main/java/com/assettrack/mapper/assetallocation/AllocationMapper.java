package com.assettrack.mapper.assetallocation;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.dto.assetallocation.AllocationHistoryDto;
import com.assettrack.dto.assetallocation.AllocationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AllocationMapper {

    @Mapping(target = "allocationId", source = "id")
    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "userId", source = "user.id")
    AllocationResponseDto toResponse(AssetAllocation allocation);

    @Mapping(target = "allocationId", source = "id")
    @Mapping(target = "userId", source = "user.id")
    AllocationHistoryDto toHistoryDto(AssetAllocation allocation);
}
