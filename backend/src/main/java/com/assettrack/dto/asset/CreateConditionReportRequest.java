package com.assettrack.dto.asset;

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
public class CreateConditionReportRequest {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotBlank(message = "Issue description is required")
    private String issueDescription;
}
