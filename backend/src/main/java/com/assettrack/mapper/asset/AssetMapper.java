package com.assettrack.mapper.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetMapper {

    @Mapping(target = "type", expression = "java(asset.getType().name())")
    @Mapping(target = "status", expression = "java(asset.getStatus().name())")
    AssetResponse toResponse(Asset asset);

    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "assetSerialNumber", source = "asset.serialNumber")
    @Mapping(target = "reportedById", source = "reportedBy.id")
    @Mapping(target = "reportedByEmail", source = "reportedBy.email")
    @Mapping(target = "status", expression = "java(report.getStatus().name())")
    ConditionReportResponse toResponse(ConditionReport report);
}
