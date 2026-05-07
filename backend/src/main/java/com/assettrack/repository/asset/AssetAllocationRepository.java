package com.assettrack.repository.asset;

import com.assettrack.domain.asset.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {

    List<AssetAllocation> findByAssetIdOrderByCheckoutDateDesc(Long assetId);

    Optional<AssetAllocation> findFirstByAssetIdAndReturnDateIsNullOrderByCheckoutDateDesc(Long assetId);
}
