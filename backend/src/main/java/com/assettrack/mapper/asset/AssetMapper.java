package com.assettrack.mapper.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.assettrack.mapper.user.UserMapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AssetMapper {

    @Mapping(target = "type", expression = "java(asset.getType().name())")
    @Mapping(target = "status", expression = "java(asset.getStatus().name())")
    @Mapping(target = "warrantyExpired", expression = "java(asset.getWarrantyExpirationDate() != null && asset.getWarrantyExpirationDate().isBefore(java.time.LocalDate.now()))")
    AssetResponse toResponse(Asset asset);

    @Mapping(target = "asset", source = "asset")
    @Mapping(target = "reportedBy", source = "reportedBy")
    @Mapping(target = "status", expression = "java(report.getStatus().name())")
    ConditionReportResponse toResponse(ConditionReport report);
}
