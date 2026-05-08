package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.assettrack.dto.user.UserResponse;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReportResponse {
    private java.util.UUID id;
    private AssetSummaryResponse asset;
    private UserResponse reportedBy;
    private String issueDescription;
    private LocalDate reportDate;
    private String status;
}
