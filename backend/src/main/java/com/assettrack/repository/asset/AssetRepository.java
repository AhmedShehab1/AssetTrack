package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, java.util.UUID>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findBySerialNumber(String serialNumber);

    @Query("SELECT a.status as status, COUNT(a) as count FROM Asset a GROUP BY a.status")
    List<StatusCount> countByStatus();

    @Query("SELECT a.type as type, COUNT(a) as count FROM Asset a GROUP BY a.type")
    List<TypeCount> countByType();

    Optional<Asset> findFirstByTypeAndStatusOrderByCreatedAtAsc(AssetType type, AssetStatus status);

    boolean existsBySerialNumber(String serialNumber);

    @Modifying
    @Query("UPDATE Asset a SET a.status = 'EXPIRED' WHERE a.warrantyExpirationDate < :today AND a.status = 'AVAILABLE'")
    int markExpiredAssets(@Param("today") LocalDate today);

    Page<Asset> findByWarrantyExpirationDateLessThanEqualOrderByWarrantyExpirationDateAsc(
            LocalDate cutoff, Pageable pageable);

    long countByWarrantyExpirationDateBetween(LocalDate from, LocalDate to);
    long countByWarrantyExpirationDateLessThan(LocalDate date);
    long countByTypeAndStatusIn(AssetType type, List<AssetStatus> statuses);

    interface StatusCount {
        AssetStatus getStatus();
        Long getCount();
    }

    interface TypeCount {
        AssetType getType();
        Long getCount();
    }
}
