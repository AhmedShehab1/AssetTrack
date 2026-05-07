package com.assettrack.repository.asset;

import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionReportRepository extends JpaRepository<ConditionReport, Long> {

    List<ConditionReport> findByAssetIdOrderByReportDateDesc(Long assetId);

    List<ConditionReport> findByReportedByIdOrderByReportDateDesc(Long userId);

    List<ConditionReport> findByStatus(ReportStatus status);
}
