package com.assettrack.dto.asset;

import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpareAssetResponse {
    private AssetResponse asset;
    private UserSummary lastOwner;
    private LocalDateTime lastDeallocatedAt;
}