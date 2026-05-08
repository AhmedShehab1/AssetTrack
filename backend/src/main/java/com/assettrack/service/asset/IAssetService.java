package com.assettrack.service.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateAssetRequest;
import com.assettrack.dto.asset.CreateConditionReportRequest;
import com.assettrack.dto.asset.UpdateAssetRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface IAssetService {
    Page<AssetResponse> searchAssets(AssetStatus status, AssetType type, String brand, String serialNumber,
            Pageable pageable);

    ConditionReportResponse createConditionReport(CreateConditionReportRequest request, Authentication authentication);

    ConditionReportResponse createConditionReport(UUID assetId, String description, ConditionSeverity severity,
            Authentication authentication);

    List<ConditionReportResponse> getConditionReports(Authentication authentication);

    List<ConditionReportResponse> getReportsByAsset(UUID assetId, Authentication authentication);

    ConditionReportResponse getReportById(UUID reportId, Authentication authentication);

    ConditionReportResponse resolveReport(UUID reportId);

    AssetResponse registerAsset(CreateAssetRequest request);

    AssetResponse getAssetById(UUID id);

    AssetResponse updateAsset(UUID id, UpdateAssetRequest request);

    void deleteAsset(UUID id);

    void expireWarrantiedAssets();
}