package com.assettrack.service.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.dto.asset.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import java.util.UUID;

public interface IAssetService {
    Page<AssetResponse> searchAssets(AssetStatus status, AssetType type, String brand, String serialNumber,
            Pageable pageable);

    ConditionReportResponse createConditionReport(CreateConditionReportRequest request, Authentication authentication);

    ConditionReportResponse createConditionReport(UUID assetId, String description, ConditionSeverity severity,
            Authentication authentication);

    Page<ConditionReportResponse> getConditionReports(Authentication authentication, Pageable pageable);

    Page<ConditionReportResponse> getReportsByAsset(UUID assetId, Authentication authentication, Pageable pageable);

    ConditionReportResponse getReportById(UUID reportId, Authentication authentication);

    ConditionReportResponse resolveReport(UUID reportId);

    AssetResponse registerAsset(CreateAssetRequest request);

    AssetResponse getAssetById(UUID id);

    AssetResponse updateAsset(UUID id, UpdateAssetRequest request);

    void deleteAsset(UUID id);

    void expireWarrantiedAssets();

    // GET /assets — list with warranty filters
    Page<AssetResponse> listAssets(AssetStatus status, AssetType type,
                                   Integer warrantyExpiringWithinDays, Boolean warrantyExpired,
                                   Pageable pageable);

    // GET /users/{userId}/assets
    Page<AssetResponse> getAssetsForUser(UUID userId, Pageable pageable);

    // GET /dashboard/expiring-warranties
    Page<ExpiringAssetSummary> getExpiringWarranties(int withinDays, Pageable pageable);

    // PATCH /assets/{assetId}/condition-reports/{reportId}
    ConditionReportResponse updateConditionReport(UUID reportId, UpdateConditionReportRequest request);
}