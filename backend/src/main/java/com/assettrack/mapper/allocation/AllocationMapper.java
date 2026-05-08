package com.assettrack.mapper.allocation;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AllocationMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "asset.id", target = "assetId")
    @Mapping(source = "asset.type", target = "type")
    @Mapping(source = "asset.brand", target = "brand")
    @Mapping(source = "asset.model", target = "model")
    @Mapping(source = "asset.serialNumber", target = "serialNumber")
    AllocationResponseDto toResponseDto(AssetAllocation allocation);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    AllocationHistoryDto toHistoryDto(AssetAllocation allocation);

    List<AllocationHistoryDto> toHistoryDtoList(List<AssetAllocation> allocations);
}
