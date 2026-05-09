package com.assettrack.dto.asset;

import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response returned when looking up an available spare laptop.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpareAssetResponse {
    /** Spare asset details. */
    private AssetResponse asset;
    /** Most recent owner before deallocation. */
    private UserSummary lastOwner;
    /** When the asset was last returned. */
    private LocalDateTime lastDeallocatedAt;
}