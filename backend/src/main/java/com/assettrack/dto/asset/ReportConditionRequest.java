package com.assettrack.dto.asset;

import jakarta.validation.constraints.NotBlank;
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
}
