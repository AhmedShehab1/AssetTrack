package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportConditionRequest {

    @NotBlank(message = "Issue description is required")
    private String description;

    @NotNull(message = "Severity is required")
    private ConditionSeverity severity;
}
