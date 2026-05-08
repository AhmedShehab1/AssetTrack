package com.assettrack.repository.asset;

import com.assettrack.domain.asset.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, java.util.UUID> {

    List<AssetAllocation> findByAssetIdOrderByCheckoutDateDesc(java.util.UUID assetId);
    Optional<AssetAllocation> findByAssetIdAndReturnDateIsNull(java.util.UUID assetId);

    boolean existsByAssetIdAndUserIdAndReturnDateIsNull(java.util.UUID assetId, java.util.UUID userId);
}
