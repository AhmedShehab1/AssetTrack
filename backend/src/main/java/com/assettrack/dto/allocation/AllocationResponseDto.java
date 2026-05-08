package com.assettrack.dto.allocation;

import com.assettrack.domain.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationResponseDto {

    private java.util.UUID id;

    private com.assettrack.dto.user.UserResponse user;

    private com.assettrack.dto.asset.AssetResponse asset;

    private LocalDateTime checkoutDate;

    private LocalDateTime returnDate;
}