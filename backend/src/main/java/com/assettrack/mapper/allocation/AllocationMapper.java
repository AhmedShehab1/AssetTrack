package com.assettrack.mapper.allocation;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = "spring", uses = { com.assettrack.mapper.user.UserMapper.class,
        com.assettrack.mapper.asset.AssetMapper.class })
public interface AllocationMapper {

    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "assignedTo", source = "user")
    @Mapping(target = "allocatedAt", source = "checkoutDate")
    @Mapping(target = "deallocatedAt", source = "returnDate")
    @Mapping(target = "notes", source = "notes")
    @Mapping(target = "active", expression = "java(allocation.getReturnDate() == null)")
    AllocationResponseDto toResponseDto(AssetAllocation allocation);

    @Mapping(target = "allocationId", source = "id")
    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "assetSerialNumber", source = "asset.serialNumber")
    @Mapping(target = "assetBrand", source = "asset.brand")
    @Mapping(target = "assetModel", source = "asset.model")
    @Mapping(target = "assignedTo", source = "user")
    @Mapping(target = "allocatedAt", source = "checkoutDate")
    @Mapping(target = "deallocatedAt", source = "returnDate")
    @Mapping(target = "durationDays", expression = "java(calculateDurationDays(allocation))")
    AllocationHistoryDto toHistoryDto(AssetAllocation allocation);

    List<AllocationHistoryDto> toHistoryDtoList(List<AssetAllocation> allocations);

    default Integer calculateDurationDays(AssetAllocation allocation) {
        if (allocation == null || allocation.getCheckoutDate() == null) {
            return null;
        }
        LocalDateTime endDate = allocation.getReturnDate() != null ? allocation.getReturnDate() : LocalDateTime.now();
        return (int) java.time.Duration.between(allocation.getCheckoutDate(), endDate).toDays();
    }
}
