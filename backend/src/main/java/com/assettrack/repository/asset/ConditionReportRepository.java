package com.assettrack.repository.asset;

import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionReportRepository extends JpaRepository<ConditionReport, java.util.UUID> {

    List<ConditionReport> findAllByOrderByReportDateDesc();

    List<ConditionReport> findByAssetIdOrderByReportDateDesc(java.util.UUID assetId);

    List<ConditionReport> findByAssetIdAndReportedByIdOrderByReportDateDesc(java.util.UUID assetId, java.util.UUID userId);

    List<ConditionReport> findByReportedByIdOrderByReportDateDesc(java.util.UUID userId);

    List<ConditionReport> findByStatus(ReportStatus status);
}
