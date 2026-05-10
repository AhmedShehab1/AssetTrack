package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.user.UserSummary;
import java.time.LocalDate;
import java.util.UUID;

public record ExpiringAssetSummary(
        UUID assetId,
        String serialNumber,
        String brand,
        String model,
        AssetType type,
        LocalDate warrantyExpirationDate,
        int warrantyExpiresInDays,
        UserSummary currentOwner,
        SuggestedAction suggestedAction
) {
    public enum SuggestedAction { REASSIGN_AS_SPARE, DECOMMISSION, RENEW_WARRANTY, REVIEW }
}