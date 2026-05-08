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

    private Long id;

    private long userId;

    private String userEmail;

    private Long assetId;

    private AssetType type;

    private String brand;

    private String model;

    private String serialNumber;

    private LocalDateTime checkoutDate;

    private LocalDateTime returnDate;
}