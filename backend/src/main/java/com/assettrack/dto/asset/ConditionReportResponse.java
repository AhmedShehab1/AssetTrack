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

/**
 * Response returned for condition report operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReportResponse {
    /** Condition report identifier. */
    private UUID id;
    /** Related asset identifier. */
    private UUID assetId;
    /** Compact asset details. */
    private AssetSummaryResponse asset;
    /** User who submitted the report. */
    private UserSummary reportedBy;
    /** Issue description. */
    private String description;
    /** Severity of the issue. */
    private ConditionSeverity severity;
    /** Current report status. */
    private ConditionReportStatus status;
    /** Optional resolution notes. */
    private String resolutionNotes;

    /** UTC timestamp when the report was created. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime reportedAt;

    /** UTC timestamp when the report was last updated. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
}
