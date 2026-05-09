package com.assettrack.repository.asset;

import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ConditionReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for asset condition reports.
 */
@Repository
public interface ConditionReportRepository extends JpaRepository<ConditionReport, java.util.UUID> {

    Page<ConditionReport> findAllByOrderByReportDateDesc(Pageable pageable);

    Page<ConditionReport> findByAssetIdOrderByReportDateDesc(java.util.UUID assetId, Pageable pageable);

    Page<ConditionReport> findByAssetIdAndReportedByIdOrderByReportDateDesc(java.util.UUID assetId,
            java.util.UUID userId, Pageable pageable);

    Page<ConditionReport> findByReportedByIdOrderByReportDateDesc(java.util.UUID userId, Pageable pageable);

    List<ConditionReport> findByStatus(ConditionReportStatus status);
}
