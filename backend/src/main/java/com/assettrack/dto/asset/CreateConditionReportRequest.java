package com.assettrack.dto.asset;

import com.assettrack.domain.asset.ConditionSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request payload for creating a condition report using an asset ID.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConditionReportRequest {

    @NotNull(message = "Asset ID is required")
    private UUID assetId;

    @NotBlank(message = "Issue description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Severity is required")
    private ConditionSeverity severity;
}
