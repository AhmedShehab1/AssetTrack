package com.assettrack.mapper.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.AssetSummaryResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.UpdateAssetRequest;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.mapper.user.UserMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring", uses = { UserMapper.class })
public abstract class AssetMapper {

    @Autowired
    protected UserMapper userMapper;

    @Mapping(target = "warrantyExpired", expression = "java(isWarrantyExpired(asset))")
    @Mapping(target = "warrantyExpiresInDays", expression = "java(getWarrantyExpiresInDays(asset))")
    @Mapping(target = "currentOwner", expression = "java(resolveCurrentOwner(asset))")
    public abstract AssetResponse toResponse(Asset asset);

    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "asset", source = "asset")
    @Mapping(target = "reportedBy", source = "reportedBy")
    @Mapping(target = "description", source = "issueDescription")
    @Mapping(target = "reportedAt", source = "reportDate")
    @Mapping(target = "status", source = "status")
    public abstract ConditionReportResponse toResponse(ConditionReport report);

    public abstract AssetSummaryResponse toSummary(Asset asset);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "allocations", ignore = true)
    @Mapping(target = "conditionReports", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void updateAssetFromRequest(UpdateAssetRequest request, @MappingTarget Asset asset);

    protected boolean isWarrantyExpired(Asset asset) {
        return asset.getWarrantyExpirationDate() != null
                && asset.getWarrantyExpirationDate().isBefore(LocalDate.now());
    }

    protected Integer getWarrantyExpiresInDays(Asset asset) {
        if (asset.getWarrantyExpirationDate() == null) {
            return null;
        }
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), asset.getWarrantyExpirationDate());
    }

    protected UserSummary resolveCurrentOwner(Asset asset) {
        if (asset == null || asset.getAllocations() == null) {
            return null;
        }
        return asset.getAllocations().stream()
                .filter(allocation -> allocation.getReturnDate() == null)
                .findFirst()
                .map(AssetAllocation::getUser)
                .map(userMapper::toSummary)
                .orElse(null);
    }
}
