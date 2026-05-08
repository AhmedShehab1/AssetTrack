package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReportResponse {
    private UUID id;
    private UUID assetId;
    private AssetSummaryResponse asset;
    private UserSummary reportedBy;
    private String description;
    private ConditionSeverity severity;
    private ConditionReportStatus status;
    private String resolutionNotes;
    private LocalDateTime reportedAt;
    private LocalDateTime updatedAt;
}
