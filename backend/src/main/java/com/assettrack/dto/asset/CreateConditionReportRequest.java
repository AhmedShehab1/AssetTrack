package com.assettrack.dto.asset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateConditionReportRequest {

    @NotNull(message = "Asset ID is required")
    private UUID assetId;

    @NotBlank(message = "Issue description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String issueDescription;

    @NotNull(message = "Severity is required")
    private Severity severity;
}
