package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSummaryResponse {
    private UUID id;
    private AssetType type;
    private String brand;
    private String model;
    private String serialNumber;
}
