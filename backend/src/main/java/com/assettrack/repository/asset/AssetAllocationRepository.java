package com.assettrack.repository.asset;

import com.assettrack.domain.asset.AssetAllocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, java.util.UUID> {

    Page<AssetAllocation> findByAssetId(java.util.UUID assetId, Pageable pageable);
    Optional<AssetAllocation> findByAssetIdAndReturnDateIsNull(java.util.UUID assetId);

    boolean existsByAssetIdAndUserIdAndReturnDateIsNull(java.util.UUID assetId, java.util.UUID userId);
}
