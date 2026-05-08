package com.assettrack.dto.allocation;

import com.assettrack.domain.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationResponseDto {

    private java.util.UUID id;

    private com.assettrack.dto.user.UserResponse user;

    private com.assettrack.dto.asset.AssetResponse asset;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime checkoutDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime returnDate;
}