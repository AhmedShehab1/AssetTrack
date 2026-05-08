package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.dto.user.UserSummary;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime reportedAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
}
