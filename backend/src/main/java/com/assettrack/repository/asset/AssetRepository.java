package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findBySerialNumber(String serialNumber);

    @Query("SELECT a.status as status, COUNT(a) as count FROM Asset a GROUP BY a.status")
    List<StatusCount> countByStatus();

    @Query("SELECT a.type as type, COUNT(a) as count FROM Asset a GROUP BY a.type")
    List<TypeCount> countByType();

    Optional<Asset> findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType type, AssetStatus status);

    interface StatusCount {
        AssetStatus getStatus();
        Long getCount();
    }

    interface TypeCount {
        AssetType getType();
        Long getCount();
    }
}
