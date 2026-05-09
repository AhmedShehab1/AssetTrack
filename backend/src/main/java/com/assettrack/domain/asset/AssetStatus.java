package com.assettrack.domain.asset;

/**
 * Lifecycle status for an asset.
 */
public enum AssetStatus {
    AVAILABLE,
    ALLOCATED,
    UNDER_REPAIR,
    DECOMMISSIONED,
    SPARE,
    EXPIRED
}
