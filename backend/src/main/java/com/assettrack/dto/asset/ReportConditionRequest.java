package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionReport;
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
    private String issueDescription;

    @NotNull(message = "Severity is required")
    private Severity severity;

    private ConditionReport conditionReport;

    
}
