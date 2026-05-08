package com.assettrack.mapper.allocation;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {com.assettrack.mapper.user.UserMapper.class, com.assettrack.mapper.asset.AssetMapper.class})
public interface AllocationMapper {

    AllocationResponseDto toResponseDto(AssetAllocation allocation);

    AllocationHistoryDto toHistoryDto(AssetAllocation allocation);

    List<AllocationHistoryDto> toHistoryDtoList(List<AssetAllocation> allocations);
}
