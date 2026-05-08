package com.assettrack.mapper.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.UpdateAssetRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import com.assettrack.mapper.user.UserMapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AssetMapper {

    @Mapping(target = "type", expression = "java(asset.getType().name())")
    @Mapping(target = "status", expression = "java(asset.getStatus().name())")
    @Mapping(target = "warrantyExpired", expression = "java(asset.getStatus() == com.assettrack.domain.asset.AssetStatus.EXPIRED)")
    @Mapping(target = "currentOwner", ignore = true)
    AssetResponse toResponse(Asset asset);

    @Mapping(target = "asset", source = "asset")
    @Mapping(target = "reportedBy", source = "reportedBy")
    @Mapping(target = "status", expression = "java(report.getStatus().name())")
    ConditionReportResponse toResponse(ConditionReport report);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateAssetFromRequest(UpdateAssetRequest request, @MappingTarget Asset asset);
}
