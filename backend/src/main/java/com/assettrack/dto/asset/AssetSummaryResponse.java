package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Compact asset representation used inside nested responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSummaryResponse {
    /** Asset identifier. */
    private UUID id;
    /** Asset type. */
    private AssetType type;
    /** Brand name. */
    private String brand;
    /** Model name. */
    private String model;
    /** Serial number. */
    private String serialNumber;
}
