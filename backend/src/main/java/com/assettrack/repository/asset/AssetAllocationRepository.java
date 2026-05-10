package com.assettrack.repository.asset;

import com.assettrack.domain.asset.AssetAllocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, UUID>,
        JpaSpecificationExecutor<AssetAllocation> {

    Page<AssetAllocation> findByAssetId(UUID assetId, Pageable pageable);

    Optional<AssetAllocation> findByAssetIdAndReturnDateIsNull(UUID assetId);

    Page<AssetAllocation> findByUserIdAndReturnDateIsNull(UUID userId, Pageable pageable);

    boolean existsByAssetIdAndUserIdAndReturnDateIsNull(UUID assetId, UUID userId);
}