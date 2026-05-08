package com.assettrack.dto.allocation;
import com.assettrack.dto.asset.AssetSummaryResponse;
import com.assettrack.dto.user.UserResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationHistoryDto {
    private java.util.UUID id;

    private UserResponse user;

    private AssetSummaryResponse asset;

    private LocalDateTime checkoutDate;

    private LocalDateTime returnDate;
}
