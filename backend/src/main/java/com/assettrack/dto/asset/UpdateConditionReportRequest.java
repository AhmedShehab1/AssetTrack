package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionReportStatus;
import jakarta.validation.constraints.Size;

public record UpdateConditionReportRequest(
        ConditionReportStatus status,

        @Size(max = 2000)
        String resolutionNotes
) {}